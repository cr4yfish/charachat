"use client";

import { useChat, Message as AIMessage } from "ai/react";
import { Textarea } from "@nextui-org/input";
import { v4 as uuidv4 } from "uuid";
import InfiniteScroll from "react-infinite-scroller";
import { Spacer } from "@nextui-org/spacer";
import { AnimatePresence, motion } from "motion/react";
import { Switch } from "@nextui-org/switch";

import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { useToast } from "@/hooks/use-toast";
import { Character, Chat, Message, Profile } from "@/types/db";
import { useRef, useState, useEffect } from "react";
import { addMessage, getMessages } from "@/functions/db/messages";
import Messagebubble from "./Messagebubble";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@nextui-org/spinner";
import { isSameDay, isToday, isYesterday } from "@/lib/utils";

import { _INTRO_MESSAGE } from "@/lib/utils";
import { addTokens as updateTokens } from "@/functions/db/profiles";
import { Avatar } from "@nextui-org/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LLMsWithAPIKeys } from "@/lib/ai";
import { useSharedChat } from "@/context/SharedChatSettings";
import ConditionalLink from "../utils/ConditionalLink";
import PersonaCard from "../persona/PersonaCard";
import Link from "next/link";
import PersonaAutocomplete from "../persona/PersonaAutocomplete";
import ToolMessage from "./ToolMessage";
import { getCharacter } from "@/functions/db/character";

type Props = {
    chat: Chat;
    initMessages: Message[];
    user: Profile;
}

export default function ChatMain(props : Props) {
    const { chat, setChat, syncDb } = useSharedChat();
    const [cursor, setCursor] = useState(props.initMessages.length);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [isSetupLoading, setIsSetupLoading] = useState(false);
    const [isSetupDone, setIsSetupDone] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isSelfDestruct, setIsSelfDestruct] = useState(false);
    const { toast } = useToast();

    const { messages, setMessages, input, handleInputChange, handleSubmit, addToolResult, append, isLoading, error, reload, stop } = useChat({
        initialMessages: props.initMessages.map((m) => {
            return {
                id: m.id,
                createdAt: m.created_at,
                content: m.content,
                role: m.from_ai ? 'assistant' : 'user',
                
            } as AIMessage
        }),
        initialInput: "",
        maxSteps: 3,
        keepLastMessageOnError: true,
        generateId: () => uuidv4(),
        body: {
            profile: props.user,
            chat: chat,
            selfDestruct: isSelfDestruct
        },
        onFinish: async (message, { usage, finishReason }) => {
            scrollToBottom();
            if (inputRef.current) {
                inputRef.current.focus();
            }

            if(!chat) {
                console.error("No chat found");
                toast({
                    title: "Error",
                    description: "No chat found. Cant save AI message.",
                    variant: "destructive"
                })
                return;
            }

            switch(finishReason) {
                case "content-filter":
                    toast({
                        title: "Content Filter",
                        description: "Your message was blocked by the content filter.",
                        variant: "destructive"
                    });
                    break;
                case "length":
                    toast({
                        title: "Message too long",
                        description: "Your message was too long.",
                        variant: "destructive"
                    });
                    break;
                case "error":
                    toast({
                        title: "Error",
                        description: "An error occured while processing your message.",
                        variant: "destructive"
                    });
                    break;
            }

            // add message to db
            const newMessage: Message = {
                id: message.id,
                chat: chat,
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
                    console.error("No key found in session storage. Log out and back in to fix this.");
                    return;
                }

                if(isSelfDestruct) {
                    // done save message or chat
                    return;
                }

                await addMessage(newMessage, key);

                /* add correct id to message payload
                const newMessages = messages.map((m) => {
                    if(m.id === message.id) {
                        return {
                            ...m,
                            id: newMessage.id
                        }
                    }
                    return m;
                })*/

                //setMessages(newMessages);
            }

        },
        onError: async (err) => {
            if(err.message === "Trying to add assistant message as user message") {
                console.log("Got expected error");
                return;
            }

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
        if(props.initMessages.length > 0) {
            setIsSetupDone(true);
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
            } else {
                setIsInputFocused(false);
            }
        }

        const handleFocus = () => {
            setIsInputFocused(true);
        }

        // add event listener to focus
        if(inputRef.current) {
            inputRef.current.addEventListener("blur", handleBlur);
            inputRef.current.addEventListener("focus", handleFocus);
        }

        return () => {
            if(inputRef.current) {
                inputRef.current.removeEventListener("blur", handleBlur);
                inputRef.current.removeEventListener("focus", handleFocus);
            }
        }
    }, [inputRef.current])

    useEffect(() => {
        const loadCharacters = async () => {
            if(!props.chat.story) return;
            const chars: Character[] = [];
            await Promise.all(
                props.chat.story.extra_characters?.map(async (charId) => {
                    const char = await getCharacter(charId);
                    chars.push(char);
                }) || []
            );
            setChat((prev) => {
                if(!prev || !prev.story) return {} as Chat; // this should never actually run
                return {
                    ...prev,
                    story: {
                        ...prev.story,
                        extra_characters_client: chars
                    }
                }
            })
        }

        if(props.chat.story && props.chat.story.extra_characters) {
            // preload the extras
            loadCharacters();
          
        }
    }, [props.chat, props.chat.story])

    const setup = async () => {
        if((props.initMessages.length > 0) || (messages.length > 0) || !chat || (chat.llm.length < 1)) return;

        setIsSetupLoading(true);

        await syncDb(chat);
        
        // Works for both, normal chats and story chats
        append({ content: _INTRO_MESSAGE(props.chat.character), role: "user", createdAt: new Date() });

        // if this is a story chat, add the first message from the story
        if(props.chat.story?.first_message && props.chat.story.first_message.length > 0) {
            setMessages([
                {
                    id: uuidv4(),
                    content: props.chat.story.first_message?.replace("{{ user }}", props.user.first_name),
                    role: "assistant",
                    createdAt: new Date()
                }
            ])

            if(isSelfDestruct) {
                return;
            }

            const key = sessionStorage.getItem("key");

            if(!key) {
                console.error("No key found in session storage. Log out and back in to fix this.");
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
        } else if(props.chat.character.first_message && props.chat.character.first_message.length > 0) {
            setMessages([
                {
                    id: uuidv4(),
                    content: props.chat.character.first_message?.replace("{{ user }}", props.user.first_name),
                    role: "assistant",
                    createdAt: new Date()
                }
            ])

            if(isSelfDestruct) {
                return;
            }

            const key = sessionStorage.getItem("key");

            if(!key) {
                console.error("No key found in session storage. Log out and back in to fix this.");
                return;
            }

            await addMessage({
                id: uuidv4(),
                chat: props.chat,
                character: props.chat.character,
                user: props.user,
                from_ai: true,
                content: props.chat.character.first_message.replace("{{ user }}", props.user.first_name),
                is_edited: false,
                is_deleted: false,
            }, key);

        }

        setIsSetupLoading(false);
        setIsSetupDone(true);
        
    }

    const loadMoreMessages = async () => {
        setIsMessagesLoading(true);
        
        const key = sessionStorage.getItem("key");

        if(!key) {
            console.error("No key found in session storage. Log out and back in to fix this.");
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
        if(isLoading) {
            stop();
        } else {
            handleSubmit(e, {
                allowEmptySubmit: true
            });
            scrollToBottom();
        }
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
                className="flex flex-col gap-2 pb-32 pt-28 px-4 h-fit min-h-full w-full max-w-6xl justify-self-center"
            >
                {messages.map((message, index) => (
                    (message.content !== _INTRO_MESSAGE(props.chat.character)) &&
                    (
                        <div key={message.id + "_wrapper"} className={``}>
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
                            <ToolMessage 
                                key={message.id + "tool"}
                                message={message}
                                chat={chat}
                                setChat={setChat}
                                user={props.user}
                                setMessages={setMessages}
                            />
                            <Messagebubble 
                                key={message.id} 
                                message={message} 
                                setMessages={setMessages}
                                index={index} 
                                chat={chat} 
                                user={props.user}
                                addToolResult={addToolResult} 
                                isLatestMessage={index == messages.length - 1}
                                showName={index == 0 || (messages[index - 1].role !== message.role) || (messages[index-1].toolInvocations?.some((t) => t.state == "result") || false )}
                                reloadMessages={reload}
                            />
                        </div>
                    )
                ))}
            </InfiniteScroll>
        </ScrollArea>
 
        {((messages.length == 0 && props.initMessages.length == 0) || (!chat?.llm)) && (
            <div className="absolute top-[100px] h-full w-full px-8 overflow-y-auto pb-40">
                <div className="relative h-fit w-full flex flex-col gap-4 items-start justify-center">
                    <div className="prose dark:prose-invert prose-h1:text-xl prose-h1:mb-2 prose-p:mt-0">
                        <h1>Chat setup</h1>
                        <p>Only AIs for which you have a key are displayed.</p>
                        <span>The following models are available for free currently:</span>
                        <ul>
                            <li>Nemo (messages used by Mistral for training)</li>
                            <li>Grok (recommended, unrestricted)</li>
                        </ul>
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

                    <div className="flex flex-col gap-2 w-full max-w-sm">
                        <div className="prose dark:prose-invert prose-p:m-0 prose-h3:m-0">
                            <h3>Selected Persona</h3>
                            <p>This is who the AI will think is you. Default is your User Profile.</p>
                        </div>
                        <PersonaCard 
                            fullWidth
                            data={ chat?.persona?.id ? chat.persona :
                                {
                                    id: props.user.user,
                                    full_name: props.chat.user.username,
                                    bio: props.chat.user.bio,
                                    avatar_link: props.chat.user.avatar_link,
                                    creator: props.chat.user,
                                    is_private: false
                                } 
                            } 
                            hasLink={false} 
                        />
                        <div className="flex flex-row flex-wrap gap-1">
                            <PersonaAutocomplete setPersona={(persona) => chat && setChat({...chat, persona: persona })} />
                            <Button onClick={() => alert("Coming soon")} variant="flat" color="secondary" startContent={<Icon filled>comedy_mask</Icon>}>Change Persona</Button>
                            <Link href={"/persona/new"}>
                                <Button variant="flat" color="secondary" startContent={<Icon>add</Icon>}>Create new</Button>
                            </Link>
                        </div>
                    
                    </div>
                    
                    <div className="flex flex-col gap-1 prose dark:prose-invert prose-p:m-0">
                        <Switch isSelected={isSelfDestruct} onValueChange={setIsSelfDestruct}>Don&apos;t save messages</Switch>
                        <p className="text-xs max-w-md">If turned on, messages won&apos;t be saved and <b className="text-red-400">will be gone</b> once you leave this page or refresh the browser. <b className="text-green-400">Encryption is turned on regardless of this option.</b></p>
                    </div>

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
            </div>   
        )}

        {messages.length == 0 && isSetupDone && (
            <div className="flex-1 flex items-center justify-center h-full overflow-y-hidden">
                <p className="text-slate-400 text-center">Pretty empty here</p>
            </div>   
        )}
        
        <AnimatePresence>
            {isSetupDone &&
            <motion.form 
                key="form"
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                onSubmit={handleSubmitAdapter} 
                className="absolute bottom-0 h-[5rem] w-full flex flex-col items-center justify-end px-4 pb-8 gap-2 max-md:pb-2"
            >
                
                <AnimatePresence>
                { isLoading &&
                    <motion.div 
                        className="flex justify-start items-center w-full max-w-lg"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <div className="px-4 py-2 rounded-lg self-start backdrop-blur-xl text-xs flex flex-row gap-2 items-center h-fit dark:text-zinc-400">
                            <Spinner size="sm" color="default" />
                            <Avatar src={props.chat.character.image_link} className="w-[20px] h-[20px]" />
                            <span>{props.chat.character.name} is writing</span>
                        </div>
                    </motion.div>
                }
                </AnimatePresence>
                
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
                        inputWrapper: "pr-1 bg-content2/50 backdrop-blur-xl",
                        innerWrapper: "flex items-center justify-center",
                    }}
                    className={`max-w-xs max-md:max-w-xs transition-all ${isInputFocused && "max-w-lg max-md:max-w-full"} `}
                    endContent={
                        <Button id="send-btn" className="self-end" type="submit" color="secondary" radius="full" isIconOnly>
                            <Icon filled>{isLoading ? "stop" : "send"}</Icon>
                        </Button>
                    } 
                />
            </motion.form >
            }
        </AnimatePresence>

        </>
    )
}