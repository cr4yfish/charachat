"use client";

import { Message as AIMessage } from "ai/react";
import { Spinner } from "@nextui-org/spinner";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useEffect, useState } from "react";
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
import { ToolInvocation } from "ai";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import Icon from "../utils/Icon";
import { deleteMessage } from "@/functions/db/messages";
  

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
    setMessages: (messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[])) => void
}

export default function Messagebubble(props: Props) {
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const { toast } = useToast();

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    useEffect(() => {
        if(isContextMenuOpen) {
            const ele = document.getElementById("blurrer");
            if(ele) { ele.setAttribute("style", "opacity: 1") }
        } else {
            const ele = document.getElementById("blurrer");
            if(ele) { ele.setAttribute("style", "opacity: 0")  }
        }
    }, [isContextMenuOpen])

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
        console.log("Deleting message", props.message)
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

    return (
        <>

         <ContextMenu onOpenChange={setIsContextMenuOpen} >

            <ContextMenuTrigger>
                <motion.div
                    {...framerListAnimationProps}
                    exit={{ opacity: 0 }}
                    custom={props.index}
                    whileTap={{ scale: 0.95, transition: { duration: .6 } }}
                    
                    className={`!select-none relative ${isContextMenuOpen && "z-50"}`}
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
                            relative rounded-3xl w-fit max-w-3/4 border-none !select-none
                            ${props.message.role == "user" ? "rounded-br ml-auto dark:bg-slate-800/50" : "mr-auto rounded-bl dark:bg-zinc-900"}
                            
                            `}
                    >
                        { props.message.role !== "user" &&
                            <CardHeader className=" py-0 pb-1 pt-3">
                                <CardTitle >
                                    
                                </CardTitle>
                            </CardHeader>
                        }
                        <CardContent className={`pt-3 pb-0 ${props.message.role !== "user" && "pt-0"} prose dark:prose-invert prose-img:rounded-xl `}>                
                            <Markdown>
                                {props.message.content}
                            </Markdown>
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
                    <ContextMenuItem disabled >
                    Edit
                    <Icon>edit</Icon>
                </ContextMenuItem>
                { props.message.role == "assistant" &&
                <ContextMenuItem disabled >
                    Report
                    <Icon>report</Icon>
                </ContextMenuItem>}

                { props.message.role == "assistant" &&
                <ContextMenuItem disabled className="dark:text-blue-400" >
                    Regenerate
                    <Icon>refresh</Icon>
                </ContextMenuItem>
                }
                <ContextMenuItem onClick={handleDelete} disabled={isDeleteLoading} className="dark:text-red-400" >
                    Delete
                    {!isDeleteLoading ? <Icon>delete</Icon> : <Spinner size="sm" color="danger" />}
                </ContextMenuItem>
            </ContextMenuContent>
            
        </ContextMenu>
        </>
    )
}