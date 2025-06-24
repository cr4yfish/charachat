import { Message as DBMessage } from "@/types/db";
import { CoreAssistantMessage, CoreToolMessage, Message, ToolInvocation } from "ai";


export function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

/**
 * Sanitizes AI messages by removing tool calls that are not completed and empty messages.
 * Also adds the args from the tool-call message to the correct tool-result message.
 * This is necessary because the tool-call message is not saved in the database, but the tool-result message is.
 * @param Array consists of CoreToolMessage and/or CoreAssistantMessage
 * @returns sanitized messages array
 */
export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>,
): Array<CoreToolMessage | CoreAssistantMessage> {

  const toolResultIds: Array<string> = [];

  // get all tool-call ids from the messages
  // these are the tool calls that were completed and have a result
  for (const message of messages) {
    if (message.role === 'tool') {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }


  const messagesBySanitizedContent = messages.map((message) => {

    if (message.role !== 'assistant') return message; // only assistant messages and tool-CALLS
    if (typeof message.content === 'string') return message; // should never happen

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedContent = message.content.filter((content: any) => {

      if (content.type === 'tool-call') {
        // Dont save parts with incomplete tool calls
        //return false;
        const toolCallId = content.toolCallId;
        // if the toolCallId is not in the toolResultIds array, we can remove it
        // this means that the tool-call was not completed and we dont want to save it
        if (!toolResultIds.includes(toolCallId)) {
          return false;
        }
        
        // get the args from the tool-call message
        // and add them to the correct tool-result message
        const args = content.args;
        
        messages.find((message) => {
          if (message.role !== 'tool') return false; // only tool messages
          if (typeof message.content === 'string') return false; // should never happen
          for (const content of message.content) {
            if (content.type === 'tool-result' && content.toolCallId === toolCallId) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (content as any).args = args; // Cast to 'any' to bypass type error
              return true;
            }
          }
          return false;
        });

        return false; // remove the tool-call message
        
      } 
      
      else if (content.type === 'text') {
        // Dont save messages with empty text content
        return content.text.length > 0;
      }

      return true;
    })

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  // remove messages with empty content
  return messagesBySanitizedContent.filter((message) => {
    if (typeof message.content === 'string') return message.content.length > 0;
    return message.content.length > 0;
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    const parts = []

    let parsedContent: object | string;

    try {
      parsedContent = JSON.parse(message.content);
    } catch {
      parsedContent = message.content; // Fallback to raw content if parsing fails
    }

    // user message
    if (typeof parsedContent === 'string') {
      parts.push({
        type: "text",
        text: parsedContent,
      });
    } 

    // assistant message
    else if (Array.isArray(parsedContent)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const content of (parsedContent as any[])) {

        // normal text response
        if (content.type === 'text') {
          parts.push(content)
        } 

        if(content.type === "image") {
          parts.push({
            ...content,
            mimeType: "image",
            type: "file",
            data: content.image
          })
        }
        
        // partial tool result -> this isnt actually saved in the db
        // so this case should never happen actually
        // also, if partial tool results would be saved in the db, they'd have the "tool" role and
        // would be handle by the addToolMessageToChat function above
        // TODO: maybe remove this case
        else if (content.type === 'tool-call') {
          parts.push({
            type: "tool-invocation",
            toolInvocation: {
              state: 'call',
              toolCallId: content.toolCallId,
              toolName: content.toolName,
              args: content.args,
            } as ToolInvocation
          });
          // TODO: Add tool-call to parts array instead of toolInvocations array
        }

        else if (content.type === 'tool-result') {
          parts.push({
            type: "tool-invocation",
            toolInvocation: {
              state: 'result',
              toolCallId: content.toolCallId,
              toolName: content.toolName,
              args: content.args,
              result: content.result,
            } as ToolInvocation
          });
          // TODO: Add tool-result to parts array instead of toolInvocations array
        }

        else if (content.type === "reasoning") {
          content.details = [
            {
              type: "text",
              text: content.text,
            }
          ]
          content.text = undefined;
          parts.push(content)
        }

      }
    }

    chatMessages.push({
      id: message.id,
      role: message.from_ai ? "assistant" : "user",
      content: "", 
      createdAt: message.created_at ? new Date(message.created_at) : undefined,
      parts: parts
    });

    return chatMessages;
  }, []);
}

export function prettyRenderSingleMessageContent(
  content: string,
): string {
  try {
     const parsed = JSON.parse(content);

    // find where type is "text" and return the text content
    if (Array.isArray(parsed)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const textContent = parsed.find((item: any) => item.type === 'text');
      if (textContent && typeof textContent.text === 'string') {
        return textContent.text;
      }
    }

   } catch {
    return content as string; // If parsing fails, return the content as is
  }

  return content; // Fallback to original content if no text found
}

export function getMessageIdFromAnnotations(message: Message) {
  if (!message.annotations) return message.id;

  const [annotation] = message.annotations;
  if (!annotation) return message.id;

  // @ts-expect-error messageIdFromServer is not defined in MessageAnnotation
  return annotation.messageIdFromServer;
}