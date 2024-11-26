"use client";

import { Message as AIMessage } from "ai/react";
import { Spinner } from "@nextui-org/spinner";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { framerListAnimationProps } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

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

import { Chat, Message, Profile } from "@/types/db";
import { ChatRequestOptions, ToolInvocation } from "ai";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import Icon from "../utils/Icon";
import { addMessage, deleteMessage, updateMessage } from "@/functions/db/messages";
import { Textarea } from "@nextui-org/input";
import { Button } from "../utils/Button";
import Image from "next/image";
import { getKeyClientSide } from "@/lib/crypto";
  

type Props = {
    message: AIMessage,
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

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [videoLink, setVideoLink] = useState<string | undefined>(undefined);
    const [isVideoGenerating , setIsVideoGenerating] = useState(false);
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

    if(props.message.toolInvocations !== undefined) {
        return (
            <>
                {props.message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                    const toolCallId = toolInvocation.toolCallId;

                    if(toolInvocation.toolName == "addNewMemory") {
                        return 'result' in toolInvocation ? (
                            <Alert key={toolCallId} className="dark:prose-invert dark:text-zinc-400 dark:bg-transparent max-w-lg justify-self-center">
                                <AlertTitle>Added a new memory</AlertTitle>
                                <AlertDescription>
                                    {toolInvocation.result}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert key={toolCallId} className=" dark:bg-transparent ">
                                <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                                    <Spinner size="sm" />
                                    <p className=" dark:text-zinc-400 ">Adding a new memory...</p>
                                </AlertTitle>
                            </Alert>
                        );
                    }

                    if(toolInvocation.toolName == "generateImage") {

                        if("result" in toolInvocation) {
                            // create new message with image
                            const newMessage: AIMessage = {
                                id: "image-" + toolCallId,
                                role: "assistant",
                                content: `![Generated Image](${toolInvocation.result})`,
                                createdAt: new Date(),
                            }

                            const handleAddMessage = async () => {
                                if(!props.chat || !props.user) return;

                                props.setMessages((messages) => [...messages, newMessage]);

                                const message: Message = {
                                    id: uuidv4(),
                                    chat: props.chat,
                                    character: props.chat.character,
                                    user: props.user,
                                    from_ai: true,
                                    content: newMessage.content,
                                    is_edited: false,
                                    is_deleted: false,
                                }

                                const key = getKeyClientSide();
                                await addMessage(message ,key);
                            }

                            const handleGenerateVideo = async () => {
                                setIsVideoGenerating(true);
                                try {

                                    const res = await fetch("/api/video", {
                                        method: "POST",
                                        body: JSON.stringify({ imageLink: toolInvocation.result, prompt: toolInvocation.args.text }),
                                    })

                                    if(!res.ok) {
                                        throw new Error("Failed to generate video");
                                    }

                                    const { link } = await res.json();

                                    console.log(link);
                                    setVideoLink(link);

                                } catch (error) {
                                    console.error(error);
                                    const err = error as Error;
                                    toast({
                                        title: "Failed to generate video",
                                        description: err.message,
                                        variant: "destructive",
                                    })
                                } finally {
                                    setIsVideoGenerating(false);
                                }

                            }

                            const handleSaveVideo = async () => {
                                const newMessage: AIMessage = {
                                    id: "video-" + toolCallId,
                                    role: "assistant",
                                    content: `<video width="320" height="240" controls>
                                    <source src=${videoLink} type="video/mp4">
                                    Your browser does not support the video tag.
                                  </video>`,
                                    createdAt: new Date(),
                                }
                                    
                                if(!props.chat || !props.user) return;

                                props.setMessages((messages) => [...messages, newMessage]);

                                const message: Message = {
                                    id: uuidv4(),
                                    chat: props.chat,
                                    character: props.chat.character,
                                    user: props.user,
                                    from_ai: true,
                                    content: newMessage.content,
                                    is_edited: false,
                                    is_deleted: false,
                                }

                                const key = getKeyClientSide();
                                await addMessage(message ,key);
                            }

                            return (
                                <div key={toolCallId} className="w-full h-full">
                                    <div className="flex flex-col items-center gap-2">
                                        <Image src={toolInvocation.result} alt="" width={200} height={200} className=" rounded-xl" />
                                        <video src={videoLink} controls className="rounded-xl" width={200} />
                                        <div className="flex flex-col gap-2">
                                            <p className="dark:text-zinc-400 text-xs max-w-xs">{toolInvocation.args.text}</p>
                                            <Button variant="flat" color="secondary" onClick={handleAddMessage}>Save in chat</Button>
                                            {!videoLink && <Button isLoading={isVideoGenerating} variant="flat" color="secondary" onClick={handleGenerateVideo}>Generate Video</Button>}
                                            {videoLink && <Button variant="flat" color="secondary" onClick={handleSaveVideo}>Save Video</Button>}
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return 'result' in toolInvocation ? (
                            <div key={toolCallId + 2} className="w-full h-full">
                            </div>
                        ) : (
                            <Alert key={toolCallId} className=" dark:bg-transparent ">
                                <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                                    <Spinner size="sm" />
                                    <p className=" dark:text-zinc-400 ">Generating an image...</p>
                                </AlertTitle>
                            </Alert>
                        );
                    }

                    if(toolInvocation) {
                        return (
                            <Alert key={toolCallId} className=" dark:bg-transparent ">
                                <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                                    <Spinner size="sm" />
                                    <p className=" dark:text-zinc-400 ">Executing tool... {toolInvocation.toolName}</p>
                                </AlertTitle>
                            </Alert>
                        )
                    }

                })}
            </>
        )
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(props.message.content).then(() => {
            toast({
                title: "Copied to clipboard",
            })
        })
    }

    const handleDelete = async () => {
        setIsDeleteLoading(true);
        try {

            if(!id) {  throw new Error("No id found. Refresh will probably fix this."); }

            await deleteMessage(id);

            props.setMessages((messages) => messages.filter((message) => message.id !== props.message.id));

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

            await handleDelete();
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
                        {props.message.role == "assistant" &&  props.showName &&
                            <div className="pl-3 pb-1 flex flex-row items-center gap-2">
                                <span className=" text-sm select-none">{props.chat?.character.name}</span>
                                {props.chat &&
                                    <div className="flex flex-row items-center gap-1 px-2 py-1 border border-zinc-700 w-fit rounded-full text-xs dark:text-zinc-400">
                                        <Icon downscale filled>auto_awesome</Icon>
                                        <div className="w-full">{props.chat.llm}</div>
                                    </div>
                                }
                            </div>
                        }
                        <Card 
                            id={props.message.id}
                            className={`
                                relative rounded-3xl w-fit max-w-3/4  !select-none
                                ${props.message.role == "user" ? "rounded-br ml-auto dark:bg-slate-800/50" : "mr-auto rounded-bl dark:bg-zinc-900"}
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
                                <p className={` text-xs text-gray-500 ${props.message.role == "user" ? "dark:text-slate-400" : "dark:text-zinc-400"} `}>
                                    {new Date((props.message.createdAt ?? "") as string).toLocaleTimeString("de-DE", { timeStyle: "short" })}
                                </p>
                            </CardFooter>
                        </Card>
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
                    <ContextMenuItem onClick={handleDelete} disabled={isDeleteLoading} className="dark:text-red-400" >
                        Delete
                        {!isDeleteLoading ? <Icon>delete</Icon> : <Spinner size="sm" color="danger" />}
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
        </>
    )
}