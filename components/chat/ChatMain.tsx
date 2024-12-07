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
import { addMessage, deleteMessage, getMessages } from "@/functions/db/messages";
import Messagebubble from "./Messagebubble";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@nextui-org/spinner";
import { isSameDay, isToday, isYesterday } from "@/lib/utils";

import { _INTRO_MESSAGE } from "@/lib/utils";
import { addTokens as updateTokens } from "@/functions/db/profiles";
import { Avatar } from "@nextui-org/avatar";
import { useSharedChat } from "@/context/SharedChatSettings";
import ConditionalLink from "../utils/ConditionalLink";
import PersonaCard from "../persona/PersonaCard";
import Link from "next/link";
import PersonaAutocomplete from "../persona/PersonaAutocomplete";
import ToolMessage from "./ToolMessage";
import { getCharacter } from "@/functions/db/character";
import { LLMsWithAPIKeys } from "@/lib/ai";
import { CardBody, Card, CardHeader } from "@nextui-org/card";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Chip } from "@nextui-org/chip";
import { getKeyClientSide } from "@/lib/crypto";


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

    const [latestMessageVariants, setLatestMessageVariants] = useState<AIMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState<AIMessage | null>(null);
    const [isNextMessageVariant, setIsNextMessageVariant] = useState(false);
    const [isSavingVariant, setIsSavingVariant] = useState(false);

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
        sendExtraMessageFields: true,
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
            const newAIMessage: Message = {
                id: message.id,
                chat: chat,
                character: props.chat.character,
                user: props.user,
                from_ai: true,
                content: message.content,
            }

            try {
                // add tokens to user
                await updateTokens(props.user.user, (props.user.tokens + (usage.totalTokens || 0)));
            } catch (error) {
                console.error("Error adding tokens", error);
            }

            // can be a tool call, which should not be added to the db
            // tool calls dont have a content
            if(newAIMessage.content !== "") {
                setCurrentMessage(message);

                if(isSelfDestruct) { return; }
                await addMessage(newAIMessage, getKeyClientSide());
            }

        },
        onError: async (err) => {
            if(err.message === "Trying to add assistant message as user message") {
                console.info("Got expected error");
                return;
            }

            console.error("Error in chat", err.message, error);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            });
        },
    });

    const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

    // handle message variants
    useEffect(() => {
        if(isLoading) return;

        const latestMessage = messages[messages.length - 1];
        if(!latestMessage) return;
        
        const messageInVariants = latestMessageVariants.some((m) => m.id === latestMessage.id);
        if(messageInVariants || latestMessage.role !== "assistant") return;

        if(isNextMessageVariant) {
            setLatestMessageVariants([...latestMessageVariants, latestMessage]);
        } else {
            setLatestMessageVariants([latestMessage]);
        }
        
    }, [latestMessageVariants, currentMessage, messages, isLoading, isNextMessageVariant])

    const setup = async () => {
        if((props.initMessages.length > 0) || (messages.length > 0) || !chat || (chat.llm.length < 1)) return;

        setIsSetupLoading(true);

        await syncDb(chat);
        
        // Works for both, normal chats and story chats
        append({ content: _INTRO_MESSAGE(props.chat.character), role: "user", createdAt: new Date() });

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
            setCurrentMessage(null);
            setIsNextMessageVariant(false);
            setLatestMessageVariants([]);
            handleSubmit(e, {
                allowEmptySubmit: true
            });
            scrollToBottom();
        }
    }

    const handleSaveVariant = async (newMessage: AIMessage, lastMessage: AIMessage) => {
        if(!chat) { return; }
        if(newMessage.content == lastMessage.content) { return; }

        setIsSavingVariant(true);

        try {
            await deleteMessage(lastMessage.id);
            const key = getKeyClientSide();
            await addMessage({
                id: newMessage.id,
                chat: chat,
                character: props.chat.character,
                user: props.user,
                from_ai: true,
                content: newMessage.content,
            }, key);
        } catch (e) {
            const err = e as Error;
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

        setIsSavingVariant(false);
    }

    const handleGenerateVariant = async () => {
        if(!currentMessage) return;

        // Generate a new message
        setIsNextMessageVariant(true);
        // step 1: remove latest message from db
        await deleteMessage(currentMessage.id);

        // step 1: remove latest message from messages array
        setMessages(messages.filter((m) => m.id !== currentMessage.id));

        // step 2: reload messages to generate a new, fresh one
        reload();
    }

    const handleSetVariant = async (variant: AIMessage) => {
        if(!currentMessage) return;

        setCurrentMessage(variant);
        handleSaveVariant(variant, currentMessage);
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
                                <div className="text-center text-sm dark:text-zinc-400 my-2">
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
                                message={((index == messages.length - 1) && currentMessage) ? currentMessage : message} 
                                messages={messages}
                                setMessages={setMessages}
                                index={index} 
                                chat={chat} 
                                user={props.user}
                                addToolResult={addToolResult} 
                                isLatestMessage={index == messages.length - 1}
                                showName={index == 0 || (messages[index - 1].role !== message.role) || (messages[index-1].toolInvocations?.some((t) => t.state == "result") || false )}
                                reloadMessages={reload}
                            />
                            { index === messages.length - 1 && currentMessage &&
                            <>
                            <div className="mt-1 flex flex-row items-center gap-2 max-w-xl">
                                <div className="max-w-[300px] pr-4 pb-1 overflow-x-auto">
                                    <div className="w-fit flex items-center gap-1">
                                        {latestMessageVariants.map((lm) => (
                                            <Button isDisabled={isSavingVariant || isLoading} onClick={() => handleSetVariant(lm)} isIconOnly variant="light" key={lm.id}>
                                                <span 
                                                    className={`
                                                    w-[10px] h-[10px] rounded-full
                                                    ${lm.content == currentMessage?.content ? "bg-zinc-700 dark:bg-zinc-400" : "bg-zinc-400 dark:bg-zinc-700"}
                                                    `}
                                                    >    
                                                </span>
                                            </Button>
                                        ))}
                                        <Button isLoading={isLoading} isDisabled={isSavingVariant} onClick={handleGenerateVariant} isIconOnly variant="light" className="dark:text-zinc-400">
                                            <Icon color="text-zinc-400">add</Icon>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            </>
                            }
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
                        <h2>1. Select an AI</h2>
                        <p>Only free AIs and ones for which you have a key are displayed.</p>
                        <ScrollShadow className="w-full overflow-x-auto py-2 max-h-[400px]">
                            <div className="flex flex-row flex-wrap gap-2 w-fit">
                                {LLMsWithAPIKeys(props.user).map((llm) => (
                                    <Card 
                                        key={llm.key} 
                                        isPressable
                                        className={`w-[150px] hover:bg-zinc-100 shadow-none dark:hover:bg-zinc-700 border dark:border-zinc-800 ${chat?.llm == llm.key && "border-green-400 dark:border-green-400"}`}
                                        onClick={() => chat && setChat({...chat, llm: llm.key})}
                                    >
                                        <CardHeader className="pb-0 flex flex-col">
                                            <span className="text-xs dark:text-zinc-400">{llm.provider}</span>
                                            {llm.name}
                                        </CardHeader>
                                        <CardBody className="text-xs pt-0 dark:text-zinc-400 flex flex-col gap-1">
                                            {llm.usecase}
                                            <div className="flex flex-row flex-wrap gap-1">
                                                {llm.tags?.map((t, index) => (
                                                    <Chip 
                                                        size="sm" 
                                                        key={index}
                                                        className={`${t == "Free" ? "bg-green-300 dark:bg-green-700 text-green-900  dark:text-green-100" : "bg-zinc-100 dark:bg-zinc-800"} `}
                                                    >
                                                        {t}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                                <Link href={`/user/${props.user.user}/edit#api`} className="no-underline">
                                    <Card isPressable className="w-[150px] h-[120px] p-0">
                                        <CardBody className="p-0 w-full h-full flex items-center justify-center">
                                                <Icon>add</Icon>
                                        </CardBody>
                                    </Card>
                                </Link>
                            </div>
                        </ScrollShadow>
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-sm">
                        <div className="prose dark:prose-invert prose-p:m-0 prose-h3:m-0">
                            <h2>2. Select a Persona</h2>
                            <p>This is who the AI will think is you. Default is your User Profile.</p>
                        </div>
                        <PersonaCard 
                            fullWidth
                            isSmall
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
                            <Link href={"/persona/new"}>
                                <Button variant="flat" color="secondary" startContent={<Icon>add</Icon>}>Create new Persona</Button>
                            </Link>
                        </div>
                    
                    </div>
                    
                    <div className="flex flex-col gap-1 prose dark:prose-invert prose-p:m-0">
                        <h2>3. Privacy</h2>
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