"use client";

import { Message as AIMessage } from "ai/react";
import { Spinner } from "@nextui-org/spinner";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react";
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

import { Chat } from "@/types/db";
import { ChatRequestOptions, ToolInvocation } from "ai";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import Icon from "../utils/Icon";
import { deleteMessage, updateMessage } from "@/functions/db/messages";
import { Textarea } from "@nextui-org/input";
  

type Props = {
    message: AIMessage,
    index: number,
    chat: Chat | null,
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

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingLoading, setIsSavingLoading] = useState(false);
    
    const [isRegenerating, setIsRegenerating] = useState(false);

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
                        return 'result' in toolInvocation ? (
                            <div key={toolCallId} className="w-full h-full">
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
            await deleteMessage(props.message.id);

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
            await updateMessage({
                content: props.message.content,
                id: props.message.id
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
                                    <Markdown>
                                        {props.message.content}
                                    </Markdown>
                                    :
                                    <Textarea
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
                        <ContextMenuItem onClick={() => setIsEditMode(true)}  className="dark:text-amber-400" >
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