"use client";

import { useChat, Message as AIMessage } from "ai/react";
import { Textarea } from "@nextui-org/input";
import { v4 as uuidv4 } from "uuid";
import InfiniteScroll from "react-infinite-scroller";
import { Spacer } from "@nextui-org/spacer";


import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { useToast } from "@/hooks/use-toast";
import { Chat, Message, Profile } from "@/types/db";
import { useRef, useState, useEffect } from "react";
import { addMessage, getMessages } from "@/functions/db/messages";
import Messagebubble from "./Messagebubble";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@nextui-org/spinner";
import { isSameDay, isToday, isYesterday } from "@/lib/utils";
import { updateChat } from "@/functions/db/chat";

import { _INTRO_MESSAGE } from "@/lib/utils";
import { addTokens as updateTokens } from "@/functions/db/profiles";
import { Avatar } from "@nextui-org/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LLMsWithAPIKeys } from "@/lib/ai";
import { useSharedChat } from "@/context/SharedChatSettings";
import ConditionalLink from "../utils/ConditionalLink";

type Props = {
    chat: Chat;
    initMessages: Message[];
    user: Profile;
}

export default function ChatMain(props : Props) {
    const { chat, setChat } = useSharedChat();
    const [cursor, setCursor] = useState(props.initMessages.length);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [isSetupLoading, setIsSetupLoading] = useState(false);
    const setupExecuted = useRef(false);
    const { toast } = useToast();

    const { messages, setMessages, input, handleInputChange, handleSubmit, addToolResult, append, isLoading, error } = useChat({
        initialMessages: props.initMessages.map((m) => {
            return {
                id: m.id,
                createdAt: m.created_at,
                content: m.content,
                role: m.from_ai ? 'assistant' : 'user',
                
            } as AIMessage
        }),
        initialInput: "",
        maxSteps: 5,
        keepLastMessageOnError: true,
        body: {
            profile: props.user,
            chat: props.chat
        },
        onFinish: async (message, { usage }) => {
            scrollToBottom();
            if (inputRef.current) {
                inputRef.current.focus();
            }
            // add message to db
            const newMessage: Message = {
                id: uuidv4(),
                chat: props.chat,
                character: props.chat.character,
                user: props.user,
                from_ai: true,
                content: message.content,
                is_edited: false,
                is_deleted: false,
            }

            try {
                // add tokens to user
                await updateTokens(props.user.user, (props.user.tokens + (usage.totalTokens || 0)));
            } catch (error) {
                console.error("Error adding tokens", error);
            }

            // can be a tool call, which should not be added to the db
            // tool calls dont have a content
            if(newMessage.content !== "") {
                
                const key = sessionStorage.getItem("key");

                if(!key) {
                    console.error("No key found in session storage");
                    return;
                }

                await addMessage(newMessage, key);
                props.chat.last_message_at = new Date().toISOString();
                await updateChat(props.chat);
            }

        },
        onError: async (err) => {
            console.error("Error in chat", err.message, error);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        }
    });

    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        setChat(props.chat);
    }, [props.chat])

    useEffect(() => {
        if((props.initMessages.length == 0) && !setupExecuted.current) {
            //setupExecuted.current = true;
            //setup();
        }
    }, [props.initMessages])

    useEffect(() => {
        if(isLoading && messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isLoading])

    useEffect(() => {
        const handleBlur = (e: FocusEvent) => {
            // if user tapped on send-btn, focus input again
            if(e.relatedTarget && (e.relatedTarget as HTMLElement).id === "send-btn") {
                if(inputRef.current) {
                    inputRef.current.focus();
                }
            }
        }

        // add event listener to focus
        if(inputRef.current) {
            inputRef.current.addEventListener("blur", handleBlur);
        }

        return () => {
            if(inputRef.current) {
                inputRef.current.removeEventListener("blur", handleBlur);;
            }
        }
    }, [inputRef.current])

    const setup = async () => {
        if((props.initMessages.length > 0) || (messages.length > 0) || !chat || (chat.llm.length < 1)) return;

        setIsSetupLoading(true);

        // Works for both, normal chats and story chats
        append({ content: _INTRO_MESSAGE, role: "user", createdAt: new Date() });

        // if this is a story chat, add the first message from the story
        if(props.chat.story) {
            setMessages([
                {
                    id: uuidv4(),
                    content: props.chat.story.first_message.replace("{{ user }}", props.user.first_name),
                    role: "assistant",
                    createdAt: new Date()
                }
            ])

            const key = sessionStorage.getItem("key");

            if(!key) {
                console.error("No key found in session storage");
                return;
            }

            await addMessage({
                id: uuidv4(),
                chat: props.chat,
                character: props.chat.character,
                user: props.user,
                from_ai: true,
                content: props.chat.story.first_message.replace("{{ user }}", props.user.first_name),
                is_edited: false,
                is_deleted: false,
            }, key);
            
            setIsSetupLoading(false);
        }

    }

    const loadMoreMessages = async () => {
        setIsMessagesLoading(true);
        
        const key = sessionStorage.getItem("key");

        if(!key) {
            console.error("No key found in session storage");
            return;
        }

        const newMessages = await getMessages({
            chatId: props.chat.id,
            from: cursor,
            limit: 10,
            key: key
        });

        if(newMessages.length === 0) {
            setCanLoadMore(false);
            return;
        }

        if(newMessages.length < 10) {
            setCanLoadMore(false);
        }

        setCursor(cursor + newMessages.length);

        // remove duplicates
        const noDupes = newMessages.filter((m) => {
            return !messages.some((msg) => msg.content === m.content)
        })

        const revMessages = noDupes.reverse();
        const mappedMessages = revMessages.map((m) => {
            return {
                id: m.id,
                createdAt: m.created_at,
                content: m.content,
                role: m.from_ai ? 'assistant' : 'user',
            } as AIMessage
        })

        setMessages(mappedMessages.concat(messages))
        setIsMessagesLoading(false);
    }

    const scrollToBottom = () => {
        const scrollArea = document.getElementById("scroller")?.querySelector("div")
        scrollArea?.scrollTo(0, scrollArea.scrollHeight);
    }

    const handleSubmitAdapter = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(e);
        scrollToBottom();
    }

    return (
        <>
        <ScrollArea id="scroller" className=" flex-1 overflow-y-scroll w-full " >
            <InfiniteScroll 
                isReverse
                id="infinitescroll"
                pageStart={1}
                initialLoad={false}
                loadMore={async () => await loadMoreMessages()}
                hasMore={canLoadMore}
                threshold={50}
                loader={isMessagesLoading ? <div className=" w-full flex items-center justify-center py-4" key={"loader"}><Spinner size="sm" /></div> : <span key="loaderempty"></span>}
                useWindow={false}
                getScrollParent={() => document.querySelector("#scroller > div")}
                className="flex flex-col gap-2 pb-5 pt-28 px-4 h-fit min-h-full w-full"
            >
                {messages.map((message, index) => (
                    (message.content !== _INTRO_MESSAGE) &&
                    (
                        <div key={message.id + "_wrapper"}>
                            {(index !== 0) && (messages[index - 1].role !== message.role) && <Spacer y={6} />}
                            {((index == 0) || !isSameDay(new Date(message.createdAt!), new Date(messages[index - 1]?.createdAt ?? ""))) && (
                                <div className="text-center text-sm dark:text-slate-400 my-2">
                                    { isToday(new Date(message.createdAt!)) 
                                        ? "Today" :
                                        isYesterday(new Date(message.createdAt!)) 
                                        ? "Yesterday" :
                                        new Date(message.createdAt!).toLocaleDateString()
                                    }
                                </div>
                            )}
                            <Messagebubble 
                                key={message.id} 
                                message={message} 
                                index={index} 
                                chat={props.chat} 
                                addToolResult={addToolResult} 
                                showName={index == 0 || (messages[index - 1].role !== message.role)}
                            />
                        </div>
                    )
                ))}
            </InfiniteScroll>
        </ScrollArea>
 
        {messages.length == 0 && props.initMessages.length == 0 && (
            <div className="flex flex-col gap-4 items-start justify-center h-full w-full px-8 overflow-y-hidden">
                <div className="prose dark:prose-invert prose-h1:text-xl prose-h1:mb-2 prose-p:mt-0">
                    <h1>Select an AI to get started</h1>
                    <p>Only ones for which you have a key are displayed. The unrestricted Model is only available to testers right now.</p>
                </div>
                
                <Select 
                    onValueChange={(value) =>  chat && setChat({...chat, llm: value})}
                    defaultValue={props.chat.llm}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select an AI" />
                    </SelectTrigger>
                    <SelectContent>
                        {LLMsWithAPIKeys(props.user).map((llm) => (
                            <SelectItem key={llm.key} value={llm.key}>{llm.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex flex-wrap items-center gap-4">
                    <Button
                        radius="full"
                        color="primary"
                        size="lg"
                        isLoading={isSetupLoading}
                        onClick={setup}
                        isDisabled={chat?.llm.length == 0}
                    >
                        Start Chat
                    </Button>       
                    <div className="w-fit">
                        <ConditionalLink active={!isSetupLoading} href={`/user/${props.user.user}/edit`} >
                            <Button
                                radius="full"
                                color="secondary"
                                size="lg"
                                variant="flat"
                                isDisabled={isSetupLoading}
                            >
                                Add API Keys
                            </Button>
                        </ConditionalLink>
                    </div>
                </div>

            </div>   
        )}

        {messages.length == 0 && (
            <div className="flex-1 flex items-center justify-center h-full overflow-y-hidden">
                <p className="text-slate-400 text-center">Pretty empty here</p>
            </div>   
        )}

        
        <form 
            onSubmit={handleSubmitAdapter} 
            className="relative h-[5rem] w-full flex flex-col items-start justify-end px-4 pb-2 gap-2"
        >
            
            {isLoading &&
                <div className="px-4 py-2 rounded-lg bg-zinc-800/25 backdrop-blur-xl text-xs flex flex-row gap-2 items-center h-fit">
                    <Spinner size="sm" />
                    <Avatar src={props.chat.character.image_link} className="w-[20px] h-[20px]" />
                    <span>{props.chat.character.name} is writing</span>
                </div>
            }

            <Textarea 
                placeholder="Send a message" 
                size="lg" 
                radius="full" 
                value={input}
                ref={inputRef}
                name="prompt"
                onChange={handleInputChange}
                minRows={1}
                maxRows={15}
                classNames={{
                    inputWrapper: "pr-1 bg-content2",
                    innerWrapper: "flex items-center justify-center",
                }}
                endContent={
                    <Button id="send-btn" className="self-end" type="submit" color="secondary" radius="full" isIconOnly>
                        <Icon filled>send</Icon>
                    </Button>
                } 
            />
        </form>
        </>
    )
}