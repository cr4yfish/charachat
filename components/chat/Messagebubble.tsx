
import { Message as AIMessage } from "ai/react";
import { Spinner } from "@nextui-org/spinner";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  

type Props = {
    message: AIMessage,
    index: number,
    chat: Chat,
    addToolResult: ({ toolCallId, result, }: {
        toolCallId: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result: any;
    }) => void
}

export default function Messagebubble(props: Props) {
    
    if(props.message.toolInvocations !== undefined) {
        return (
            <>
                {props.message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                    const toolCallId = toolInvocation.toolCallId;

                    if(toolInvocation.toolName == "addNewMemory") {
                        return 'result' in toolInvocation ? (
                            <Alert key={toolCallId} className="dark:prose-invert dark:text-slate-400">
                                <AlertTitle>Added a new memory</AlertTitle>
                                <AlertDescription>
                                    {toolInvocation.result}
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert key={toolCallId} className=" dark:bg-transparent ">
                                <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                                    <Spinner size="sm" />
                                    <p className=" dark:text-slate-400 ">Adding a new memory...</p>
                                </AlertTitle>
                            </Alert>
                        );
                    }

                })}
            </>
        )
    }

    return (
        <>

         <ContextMenu>

            <ContextMenuTrigger>
                <motion.div
                    {...framerListAnimationProps}
                    custom={props.index}
                    whileTap={{ scale: 0.95, transition: { duration: .6 } }}
                    
                    className=" select-none"
                >
                    <Card 
                        id={props.message.id}
                        className={`
                            ${props.message.role == "user" ? "bg-blue-100 dark:bg-slate-500/15" : "bg-gray-100 dark:bg-blue-500/10"}
                            ${props.message.role == "user" ? "ml-auto" : "mr-auto"}
                            w-fit
                            max-w-3/4
                        `}
                    >
                        { props.message.role !== "user" &&
                            <CardHeader className=" py-0 pb-1 pt-3">
                                <CardTitle className=" text-blue-500 ">
                                    {props.chat.character.name}
                                </CardTitle>
                            </CardHeader>
                        }
                        <CardContent className={`pt-3 pb-0 ${props.message.role !== "user" && "pt-0"} prose dark:prose-invert `}>                
                            <Markdown>
                                {props.message.content}
                            </Markdown>
                        </CardContent>
                        <CardFooter className=" py-1 pb-3">
                            <p className=" text-xs text-gray-500 dark:text-slate-400 ">
                                {new Date((props.message.createdAt ?? "") as string).toLocaleTimeString()}
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </ContextMenuTrigger>

             <ContextMenuContent className="w-64">
                <ContextMenuItem inset>
                    back
                </ContextMenuItem>
            </ContextMenuContent>
            
        </ContextMenu>
        </>
    )
}