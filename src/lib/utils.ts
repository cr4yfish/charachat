import { Message as DBMessage } from "@/types/db";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { placeholderImage } from "./defaults";
import { CoreAssistantMessage, CoreToolMessage, Message, ToolInvocation } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const framerListAnimationProps = {
  initial: "hidden",
  animate: "visible",
  variants: {
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
  hidden: { opacity: 0, y: 30 },
}}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}

export function getDayBefore(date: Date): Date {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return yesterday;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isYesterday(date: Date): boolean {
  return isSameDay(date, getDayBefore(new Date()));
}

export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const day = date.getDay();
  return isSameDay(date, today) || (date > getDayBefore(today) && day >= today.getDay());
}

/**
 * Returns either:
 * - {time} if the message was sent today
 * - {Weekday abbreviation} if the message was sent this week
 * - {local date string} if the message was sent before this week
 * @param date 
 */
export function formatLastMessageTime(date: Date): string {
  if(isToday(date)) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  if(isThisWeek(date)) {
    return date.toLocaleDateString([], {weekday: 'short'});
  }

  return date.toLocaleDateString();
  
}

/**
 * Custom truncate function that truncates text to a specified length and adds "..." if it exceeds that length.
 * If the text is shorter than or equal to the specified length, it returns the text as is.
 * 
 * @param text 
 * @param maxLength 
 * @returns 
 */
export const truncateText = (text: string | undefined, maxLength=40) => {
  if(!text) return '';

  if (text.length <= maxLength) {
      return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Holy shit this is so stupid
 * @param string 
 * @returns 
 */
export function isValidURL(string: string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  } 
}

export function safeParseLink(link: string | undefined | null): string {
  if(link && isValidURL(link) && link.includes("https://")) {
    return link;
  }
  return placeholderImage;
}

export async function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(async () => {
        resolve();
    }, ms);
  })
}

export function replaceVariables(text = "", variables?: Record<string, string>) {
  if(!text || !variables) {
    return text;
  }
  return text?.replace(/\${(.*?)}/g, (_, match) => {
    return variables[match] || '';
  });
}

export const getChatVariables = (username: string, charName: string): Record<string, string> => {
  return {
    "{{user}}": username,
    "{{char}}": charName
  }
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

/**
 * Formats a date object into a human-readable string.
 * Works on both server and client side.
 * Agnostic to the user's locale!
 * (-> Won't throw hydration errors if browser and server have different locales)
 * @param date 
 * @returns string
 */

type PrettyPrintDateOptions = {
  group?: "day" | "month" | "year",
  short?: boolean;
}

export function prettyPrintDate(date: Date | string, userOptions?: PrettyPrintDateOptions) {
  let dateObj: Date;

  if(typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (userOptions?.group === "day") {
    options.month = '2-digit';
    options.day = '2-digit';
  } else if (userOptions?.group === "month") {
    options.day = undefined;
    options.hour = undefined;
    options.minute = undefined;
  } else if (userOptions?.group === "year") {
    options.month = undefined;
    options.day = undefined;
  }

  if(userOptions?.short) {
    options.minute = undefined;
    options.year = undefined;
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Estimates the number of lines a text will wrap into, very roughly and very fast.
 * This method is based on character count and is NOT accurate for varying character widths.
 *
 * @param {string} text The text content.
 * @param {number} maxWidth The maximum width available for the text (in pixels).
 * @param {number} avgCharWidth An estimated average pixel width of a single character for your font.
 * You'll need to determine this value empirically (e.g., by measuring a common character like 'x' or 'n' or an average word).
 * A reasonable starting point for 14px sans-serif might be 7-8px.
 * @returns {number} The estimated number of lines.
 */
export const estimateLinesRoughly = (text: string, maxWidth: number, avgCharWidth: number) => {
  if (!text) {
    return 0;
  }
  if (maxWidth <= 0 || avgCharWidth <= 0) {
    return text.length > 0 ? 1 : 0; // If no space, at least one line for non-empty text
  }

  // 1. Calculate estimated characters per line
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);

  if (charsPerLine <= 0) {
    // If even one character doesn't fit, each character takes a line
    return text.length;
  }

  // 2. Calculate total lines
  const totalCharacters = text.length; // Simple char count, doesn't distinguish wide/narrow chars
  let estimatedLines = Math.ceil(totalCharacters / charsPerLine);

  // Ensure at least 1 line for non-empty text
  if (estimatedLines === 0 && text.length > 0) {
    estimatedLines = 1;
  }

  return estimatedLines;
};

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