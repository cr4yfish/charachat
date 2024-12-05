"use client";

import { Message as AIMessage } from "ai/react";
import { Spinner } from "@nextui-org/spinner";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { framerListAnimationProps } from "@/lib/utils";

import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
    CardTitle,
} from "@/components/ui/card"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import { Chat,Profile } from "@/types/db";
import { ChatRequestOptions } from "ai";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import Icon from "../utils/Icon";
import { deleteMessage, updateMessage } from "@/functions/db/messages";
import { Textarea } from "@nextui-org/input";
import { Button } from "../utils/Button";
import { generateAudioTool } from "@/functions/ai/tools";
import { Avatar } from "@nextui-org/avatar";
  

type Props = {
    message: AIMessage,
    messages: AIMessage[],
    index: number,
    chat: Chat | null,
    user: Profile | null,
    addToolResult: ({ toolCallId, result, }: {
        toolCallId: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: any;
    }) => void,
    showName: boolean,
    setMessages: (messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[])) => void,
    isLatestMessage: boolean,
    reloadMessages: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>
}

export default function Messagebubble(props: Props) {
    const { toast } = useToast();

    const [id, setId] = useState<string | undefined>(undefined);

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingLoading, setIsSavingLoading] = useState(false);
    
    const [isRegenerating, setIsRegenerating] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioLink, setAudioLink] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    /* TODO Fix blurrer
    useEffect(() => {
        if(isContextMenuOpen) {
            const ele = document.getElementById("blurrer");
            if(ele) { ele.setAttribute("style", "opacity: 1") }
        } else {
            const ele = document.getElementById("blurrer");
            if(ele) { ele.setAttribute("style", "opacity: 0")  }
        }
    }, [isContextMenuOpen])
    */

    useEffect(() => {
        if(props.message.id.includes("-")) {
            setId(props.message.id);
        } else if(props.message.data) {
            setId(props.message.data as string);
        }
    }, [props.message.id])


    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(props.message.content).then(() => {
            toast({
                title: "Copied to clipboard",
            })
        })
    }

    const handleDelete = async (idToDelete: string) => {
        setIsDeleteLoading(true);
        try {

            if(!id) {  throw new Error("No id found. Refresh will probably fix this."); }

            await deleteMessage(idToDelete);

            props.setMessages((messages) => messages.filter((message) => message.id !== idToDelete));

        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Failed to delete message",
                description: err.message,
                variant: "destructive",
            })
        }
    }

    const handleDeleteThisMessage = async () => {
        handleDelete(props.message.id);
    }

    const handleSaveMessage = async () => {
        
        setIsSavingLoading(true);

        try {
            if(!id) {  throw new Error("No id found"); }

            await updateMessage({
                content: props.message.content,
                id: id
            });
            
        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Failed to save message",
                description: err.message,
                variant: "destructive",
            })
        }
        setIsEditMode(false);
        setIsSavingLoading(false);
    }

    const handleRegenerate = async () => {
        // First delete message and then relaod
        setIsRegenerating(true);

        try {

            // Delete this message (AI)
            await handleDelete(props.message.id);

            // Delete last message (User)
            const lastMessages = props.messages[props.messages.length - 2];
            if(lastMessages.role === "user") {
                await deleteMessage(lastMessages.id); // just delete from db, not from log
            }

            await props.reloadMessages();

        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Failed to regenerate message",
                description: err.message,
                variant: "destructive",
            })
        }

        setIsRegenerating(false);
    }

    const handleSetEditMode = () => {
        setIsEditMode(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 500);
    }

    const handleGenerateAudio = async () => {
        if(!props.chat || !props.user) { 
            throw new Error("No chat or user found. Refresh will probably fix this."); 
        }
        try {
            setIsLoadingAudio(true);
            const { link, error } = await generateAudioTool({
                chat: props.chat,
                profile: props.user,
                prompt: props.message.content,
            })

            if(error) {
                throw new Error(error);
            }

            if(!link) {
                throw new Error("Could not generate Audio. Unknown Error.");
            }

            setAudioLink(link);
            setIsLoadingAudio(false);
            return link;
        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Failed to generate audio",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setIsLoadingAudio(false);
        }
        return null;
    }

    const handleStopAudio = () => {
        if(audioRef.current) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
        }
    }

    const handlePlayAudio = async () => {
        try {
            let link = audioLink;
            if(!link) {
                link = await handleGenerateAudio();
            };

            if(link === null) { return; }
    
            setIsAudioPlaying(true);
            const audio = new Audio(link);
            audioRef.current = audio;
            audio.play();
    
            audio.addEventListener("ended", () => {
                setIsAudioPlaying(false);
            })
        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Failed to play audio",
                description: err.message,
                variant: "destructive",
            })
        }
    }

    return (
        <>
        <div className={`w-fit ${props.message.role === "user" ? "ml-auto" : "mr-auto"}`}>
            <ContextMenu>
                <ContextMenuTrigger className={`w-fit ${isEditMode && "z-50"} `}>
                    <motion.div
                        {...framerListAnimationProps}
                        exit={{ opacity: 0 }}
                        custom={props.index}
                        whileTap={{ scale: 0.95, transition: { duration: .6 } }}
                        
                        className={`!select-none relative w-fit ${isEditMode && "z-50"} `}
                    >
                        {props.showName &&
                            <div className={`pl-3 pb-1 flex flex-row items-center gap-2 ${props.message.role === "user" && "justify-end"}`}>
                                <span className={`text-sm select-none flex items-center gap-2 ${props.message.role === "user" && "flex-row-reverse"}`}>
                                    <Avatar 
                                        size="sm" 
                                        src={props.message.role === "user" ? (props.chat?.persona?.avatar_link || props.chat?.user.avatar_link) : props.chat?.character.image_link} 
                                    />
                                    {props.message.role === "user" ? (props.chat?.persona?.full_name || props.chat?.user.username) : props.chat?.character.name}
                                </span>
                                {props.chat && props.message.role === "assistant" &&
                                    <div className="flex flex-row items-center gap-1 px-2 py-1  w-fit rounded-full text-xs dark:text-zinc-400">
                                        <Icon downscale filled>auto_awesome</Icon>
                                        <div className="w-full">{props.chat.llm}</div>
                                    </div>
                                }
                            </div>
                        }
                        <Card 
                            id={props.message.id}
                            className={`
                                relative rounded-3xl w-fit max-w-3/4  !select-none shadow-none
                                ${props.message.role == "user" ? "rounded-br ml-auto dark:bg-slate-600/20" : "mr-auto rounded-bl dark:bg-zinc-900/0"}
                                ${isEditMode ? "border-1 dark:border-amber-400" : "border-none"}
                                `}
                        >
                            { props.message.role !== "user" &&
                                <CardHeader className=" py-0 pb-1 pt-3">
                                    <CardTitle >
                                        
                                    </CardTitle>
                                </CardHeader>
                            }
                            <CardContent className={`pt-3 pb-0 ${props.message.role !== "user" && "pt-0"} prose dark:prose-invert prose-img:rounded-xl `}>                
                                {!isEditMode ? 
                                    <Markdown
                                        rehypePlugins={[rehypeRaw]}
                                    >
                                        {props.message.content}
                                    </Markdown>
                                    :
                                    <Textarea
                                        ref={textareaRef}
                                        classNames={{
                                            base: "bg-transparent dark:bg-transparent !focus:bg-transparent",
                                            inputWrapper: "bg-transparent !dark:bg-transparent !focus:bg-transparent group-data-[focus=true]:bg-trasnparent data-[hover=true]:bg-transparent",
                                        }}
                                        endContent={
                                        <div className="absolute right-0 bottom-0">
                                            {isSavingLoading && <Spinner size="sm" color="warning" />}
                                        </div>
                                        }
                                        isDisabled={isSavingLoading}
                                        onBlur={handleSaveMessage}
                                        value={props.message.content}
                                        onValueChange={(value) => {
                                            props.setMessages((messages) => messages.map((message) => {
                                                if(message.id === props.message.id) {
                                                    return {
                                                        ...message,
                                                        content: value,
                                                    }
                                                }
                                                return message;
                                            }))
                                        }}
                                    />    
                                }
                            </CardContent>
                            <CardFooter className=" py-1 pb-3">
                                <p className={` text-xs text-gray-500 ${props.message.role == "user" ? "dark:text-zinc-400" : "dark:text-zinc-400"} `}>
                                    {new Date((props.message.createdAt ?? "") as string).toLocaleTimeString("de-DE", { timeStyle: "short" })}
                                </p>
                            </CardFooter>
                        </Card>
                        <div className="flex flex-row items-center gap-1 dark:text-zinc-400 mt-1">
                            <Button onClick={handleDeleteThisMessage} variant="light" isIconOnly size="sm">
                                <Icon downscale color="zinc-400" >delete</Icon>
                            </Button>
                            <Button onClick={handleSetEditMode} variant="light" isIconOnly size="sm">
                                <Icon downscale color="zinc-400" >edit</Icon>
                            </Button>
                            <Button onClick={handleCopyToClipboard} variant="light" isIconOnly size="sm">
                                <Icon downscale color="zinc-400" >content_copy</Icon>
                            </Button>                            
                            {props.isLatestMessage &&  props.message.role === "assistant" &&
                                <Button onClick={handleRegenerate} variant="light" isIconOnly size="sm">
                                    <Icon downscale color="zinc-400" >refresh</Icon>
                                </Button>
                            }
                            {props.message.role === "assistant" &&
                                <Button 
                                    isLoading={isLoadingAudio} 
                                    onClick={() => {
                                        if(isAudioPlaying) {
                                            handleStopAudio();
                                        } else {
                                            handlePlayAudio();
                                        }
                                    }} 
                                    variant="light" 
                                    isIconOnly 
                                    size="sm"
                                >
                                    <Icon color="zinc-400" >{!isAudioPlaying ? "play_arrow" : "stop"}</Icon>
                                </Button>
                            }

                        </div>
                        
                    </motion.div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64 flex flex-col">
                    <ContextMenuItem disabled >
                        Reply
                        <Icon>reply</Icon>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleCopyToClipboard} >
                        Copy
                        <Icon>content_copy</Icon>
                    </ContextMenuItem>
                        <ContextMenuItem onClick={handleSetEditMode}  className="dark:text-amber-400" >
                        Edit
                        <Icon>edit</Icon>
                    </ContextMenuItem>
                    { props.message.role == "assistant" &&
                    <ContextMenuItem disabled >
                        Report
                        <Icon>report</Icon>
                    </ContextMenuItem>}

                    { props.message.role == "assistant" &&
                    <ContextMenuItem disabled={!props.isLatestMessage} onClick={handleRegenerate} className="dark:text-blue-400" >
                        Regenerate
                        {!isRegenerating ? <Icon>refresh</Icon> : <Spinner size="sm" color="primary" />}
                    </ContextMenuItem>
                    }
                    <ContextMenuItem onClick={handleDeleteThisMessage} disabled={isDeleteLoading} className="dark:text-red-400" >
                        Delete
                        {!isDeleteLoading ? <Icon>delete</Icon> : <Spinner size="sm" color="danger" />}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
        </>
    )
}