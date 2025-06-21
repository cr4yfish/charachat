'use client';

import { Message, useChat } from '@ai-sdk/react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';;
import { PromptInput } from './prompt-input';
import { v4 as uuidv4 } from 'uuid';
import { cn, fetcher } from '@/lib/utils';
import { ChatSetup } from './chat-setup';
import { useParams, useRouter } from 'next/navigation';
import { ERROR_MESSAGES } from '@/lib/errorMessages';
import { toast } from 'sonner';
import { ImageGenDrawer } from './image-gen-drawer';
import { ShallowCharacter } from '@/types/db';
import { _INTRO_MESSAGE_PLACEHOLDER } from '@/lib/defaults';
import useLLMCookie from '@/hooks/useLLMCookie';
import { addMemoryToRAG, RAGMemory, searchRAG } from '@/lib/ai/browser-rag/rag';
import useSWRInfinite from 'swr/infinite';
import { API_ROUTES } from '@/lib/apiRoutes';
import { LIMITS } from '@/lib/limits';
import { Virtuoso } from 'react-virtuoso';
import { TIMINGS_MILLISECONDS } from '@/lib/timings';
import { Message as MessageComponent } from './message';
import { TOOL_NAMES } from '@/lib/toolNames';

type Props = {
  shallowCharacter: ShallowCharacter;
  chatId: string;
  initialMessages: Message[];
}

export const PureChat = (props: Props) => {
  const { id: pathnameID } = useParams();
  const router = useRouter();
  const { llmCookie } = useLLMCookie();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const virtuosoRef = useRef<any>(null);
  const [setupDone, setSetupDone] = useState(props.initialMessages ? props.initialMessages.length > 0 : false);
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { messages, setMessages, status, append } = useChat({
    maxSteps: 1,
    sendExtraMessageFields: true,
    body: {
      chatId: props.chatId,
      characterId: props.shallowCharacter.id,
      modelId: llmCookie,
      isIntro: false,
    },
    initialMessages: props.initialMessages,
    onFinish: (message) => {
      // Handle the message when the chat is finished
      console.log("Chat finished with message:", message);

      // If the pathname ID does not match the chat ID, redirect to the chat page
      if(!pathnameID) { router.replace("/chat/" + props.chatId); } 
      
      else {

        // ok let me cook

        const memory: RAGMemory = {
          id: uuidv4(),
          text: message.content,
          chatId: props.chatId,
          role: message.role as "user" | "assistant",
          timestamp: new Date().toISOString(),
        }

        addMemoryToRAG(memory).catch((error) => {
          console.error("Error adding AI memory to RAG:", error);
          toast.error("Error adding AI memory to RAG: " + error.message);
        })

      }

    },
    onError: (error) => {
      // console.error("Chat error:", error);

      switch(error.message) {
        case ERROR_MESSAGES.CHAT_NOT_FOUND:
          toast.error(ERROR_MESSAGES.CHAT_NOT_FOUND);
          break;
        case ERROR_MESSAGES.CHAT_CREATION_FAILED:
          toast.error(ERROR_MESSAGES.CHAT_CREATION_FAILED);
          break;
        case ERROR_MESSAGES.CHAT_UPDATE_FAILED:
          toast.error(ERROR_MESSAGES.CHAT_UPDATE_FAILED);
          break;
        case ERROR_MESSAGES.CHAT_ID_REQUIRED:
          toast.error( ERROR_MESSAGES.CHAT_ID_REQUIRED);
          break;
        case ERROR_MESSAGES.LLM_MODEL_REQUIRED:
          toast.error(ERROR_MESSAGES.LLM_MODEL_REQUIRED); 
          break;
        case ERROR_MESSAGES.CHARACTER_NOT_FOUND:
          toast.error(ERROR_MESSAGES.CHARACTER_NOT_FOUND);
          break;

        case ERROR_MESSAGES.UNAUTHORIZED:
          // toast.error(ERROR_MESSAGES.UNAUTHORIZED);

          // We're going to add a tool message to the chat where they can log in
          
          // add an assistant message to the chat
          setMessages((prevMessages) => {
            const newMessage: Message = {
              id: uuidv4(),
              role: "assistant",
              content: "",
              createdAt: new Date(),
              parts: [
                {
                  type: "tool-invocation",
                  toolInvocation: {
                    toolName: TOOL_NAMES.login,
                    toolCallId: uuidv4(),
                    args: {},
                    result: "",
                    state: "result"
                  }
                }
              ]
            };
            return [...prevMessages, newMessage];
          });

          break;

        default:
          toast.error(ERROR_MESSAGES.GENERIC_ERROR);
      }
    },
  });
  
  const { setSize } = useSWRInfinite<Message[]>(
    (pageIndex, previousPageData) => {
      // If there are no previous pages, return null to stop fetching
      if (previousPageData && previousPageData.length === 0) return null;

      // pageIndex*Limit -> full number of messages fetched so far
      // add one limit to offset for the initial server-side fetched messages
      const cursor = pageIndex * LIMITS.MAX_MESSAGES_PER_PAGE + LIMITS.MAX_MESSAGES_PER_PAGE;
      // Return the key for the next page
      return `${API_ROUTES.GET_CHAT_MESSAGES}${props.chatId}&from=${cursor}&limit=${LIMITS.MAX_MESSAGES_PER_PAGE}`;
    },
    fetcher,
    {
      fallbackData: [props.initialMessages],
      revalidateFirstPage: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      dedupingInterval: TIMINGS_MILLISECONDS.FIVE_MINUTES, // 5 minutes
      focusThrottleInterval: TIMINGS_MILLISECONDS.FIVE_MINUTES, // 5 minutes
      suspense: true
    }
  )

  // useEffect(() => {
  //   const flat = data ? data.flat() : []; 
    
  //   // add the new messages to the start of the messages array
  //   setMessages((prevMessages) => {
  //     // If the previous messages are empty, return the flat messages
  //     if (!prevMessages || prevMessages.length === 0) return flat;

  //     // there can be duplicate messages, so we need to filter them out
  //     // filter by ID
  //     const uniqueMessages = flat.filter((msg) => !prevMessages.some((prevMsg) => prevMsg.id === msg.id));

  //     console.log("Unique messages:", uniqueMessages);
  //     // Otherwise, return the flat messages with the previous messages
  //     return uniqueMessages.concat(prevMessages);
  //   });
    
  // }, [data, setMessages]);

  const isLoading = useMemo(() => {
    return status === 'streaming' || status === 'submitted';
  }, [status]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const submitMiddleWare = useCallback((input: string) => {
    if(!setupDone) {
      setSetupDone(true);
    }

    // Create a new message object
    const message: Message = {
      id: uuidv4(),
      createdAt: new Date(),
      role: "user",
      content: input
    };
    
    // Test if RAG is fast enough here
    searchRAG(input, LIMITS.MAX_RAG_RESULTS).then((memories) => {

      // user message appender
      append(message, 
        { 
          allowEmptySubmit: false, 
          body: { 
            chatId: props.chatId, 
            modelId: llmCookie, 
            isUserMessage: true,
            memories: memories
          } 
        }
      );
    }).catch((error) => {
      console.error("Error searching RAG:", error);
      toast.error("Error searching RAG: " + error.message);
    }).finally(() => {
      // get the difference between the top of the latest message and the top of the scroll container
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;

      // scroll down in a way to get the scrollTopDifference to 0
      scrollContainer.scrollBy({
        top: scrollContainer.scrollHeight, // scroll down by the difference
        behavior: 'smooth', // smooth scroll
      });
      

    })

    // Add memory to RAG
    const memory: RAGMemory = {
      id: uuidv4(),
      text: input,
      chatId: props.chatId,
      role: "user",
      timestamp: new Date().toISOString(),
    };

    addMemoryToRAG(memory).catch((error) => {
      console.error("Error adding user memory to RAG:", error);
    });

    
  }, [setupDone, append, props.chatId, llmCookie, scrollRef]);

  const addIntroMessage = useCallback(() => {
    setSetupDone(true);

    // Intro message appender
    append({ 
      id: uuidv4(),
      content: _INTRO_MESSAGE_PLACEHOLDER, 
      role: "user", 
      createdAt: new Date() 
    }, {
      body: {
        chatId: props.chatId,
        characterId: props.shallowCharacter.id,
        isIntro: true,
        modelId: llmCookie,
        isUserMessage: true,
      }
    });

  }, [append, props.chatId, props.shallowCharacter.id, llmCookie]);

  const handleLoadMore = useCallback(() => {
    // Load more messages by increasing the size of the SWR infinite data 
    setSize((prevSize) => prevSize + 1);
  }, [setSize]);

  const deleteCallback = useCallback((messageId: string) => {
    // Filter out message
    setMessages((prevMessages) => {
      return prevMessages.filter((msg) => msg.id !== messageId);
    });
  }, [setMessages]);

  const imageCallback = useCallback((imageUrl: string, prompt: string) => {
    // Append the image URL to the chat
    const toolInvocation = {
      type: "tool-invocation",
      toolInvocation: {
        toolName: TOOL_NAMES.generateImage,
        toolCallId: uuidv4(),
        args: {
          imageUrl: imageUrl,
          prompt: prompt,
        },
        result: imageUrl,
        state: "result"
      }
        
    }

    const newMsg = {
      id: uuidv4(),
      role: "assistant",
      parts: [
        toolInvocation
      ],
      createdAt: new Date(),
    } as Message
    setMessages((prevMessages) => [  ...prevMessages,  newMsg ]);

    // add message to db
    fetch(API_ROUTES.ADD_CHAT_MESSAGE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          ...newMsg,
          parts: [
            {
              type: "tool-result", // Change type to tool-result for the final message
              ...toolInvocation.toolInvocation
            }
          ]
        },
        chatId: props.chatId
      }),
    }).catch((error) => {
      console.error("Error adding image message to chat:", error);
      toast.error("Error adding image message to chat: " + error.message);
    })

  }, [setMessages, props.chatId]);

  return (
    <>
    <div id='messages' className='h-dvh min-w-0 w-full'>

      {(messages.length === 0) && !setupDone && (
        <div className='flex items-center justify-center h-full'>

            <ChatSetup 
              setDone={addIntroMessage} 
              append={append}
            />

        </div>
      )}

      <Virtuoso 
        className='w-full h-full'
        ref={virtuosoRef}
        scrollerRef={(ref) => {
          if (scrollRef.current !== ref) {
            scrollRef.current = ref as HTMLDivElement;
          }
        }}
        data={messages}
        atBottomStateChange={setIsAtBottom}
        initialTopMostItemIndex={messages.length - 1}
        overscan={3}
        alignToBottom={true}
        startReached={handleLoadMore}
        itemContent={(index, message) => {
          return (
            <div key={message.id} className={cn("h-fit w-full relative max-w-[760px] px-4 mx-auto", {
              "pt-[100px]": index === 0 && messages.length > 2, // add padding to the first message
              "pb-[40vh]": index === messages.length - 1, // add padding to the last message
            })}>
              <MessageComponent
                key={message.id} 
                message={message} 
                isLoading={isLoading && messages.length - 1 === index}
                characterName={props.shallowCharacter.name}
                characterImage={props.shallowCharacter.image_link}
                openImageGen={() => setImageGenOpen(true)}
                chatId={props.chatId}
                deleteCallback={deleteCallback}
                status={status}
                latestMessage={messages[messages.length - 1]?.id === message.id}
              />
            </div>
          )
        }}
      />

      <PromptInput
        submitMiddleWare={submitMiddleWare}
        isLoading={isLoading}
        chatId={props.chatId}
      />

      <div className='fixed bottom-0 left-0 w-full h-[20px] bg-gradient-to-t from-background to-transparent backdrop-blur-[1px] pointer-events-none '></div>

      <div className={cn("fixed bottom-0 left-0 w-full h-[1px] rounded-t-3xl bg-gradient-to-l from-sky-400 to-fuchsia-400 opacity-0 transition-all", {
        "opacity-100": isAtBottom,
      })}></div>

      <ImageGenDrawer 
        isOpen={imageGenOpen}
        onOpenChange={setImageGenOpen}
        callback={imageCallback}
      />
    </div>
    </>
  );
}

export const Chat = memo(PureChat, (prev, next) => {
  //if (prev.shallowCharacter?.id !== next.shallowCharacter?.id) return false;
  if (prev.chatId !== next.chatId) return false;
  //if (JSON.stringify(prev.initialMessages) !== JSON.stringify(next.initialMessages)) return false;

  return true;
});