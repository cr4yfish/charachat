import { Message as MessageType, UIMessage } from "ai";
import Image from "next/image";
import { memo, useMemo, useState } from "react";
import { Markdown } from "../ui/markdown";
import { Button } from "../ui/button";
import { CopyIcon, EditIcon, ImageIcon, TrashIcon, VolumeIcon } from "lucide-react";
import { motion } from "motion/react";
import { _INTRO_MESSAGE_PLACEHOLDER } from "@/lib/defaults";
import { TOOL_NAMES } from "@/lib/toolNames";
import equal from 'fast-deep-equal';
import { cn, getMessageIdFromAnnotations } from "@/lib/utils";
import { API_ROUTES } from "@/lib/apiRoutes";
import { toast } from "sonner";

const PureHeader = ({ image, name, role}: { image?: string, name?: string, role: string }) => {
    return (
        <div className="font-medium text-sm flex items-center gap-2">
            <div className="flex items-center gap-2 dark:text-neutral-400 text-neutral-600">
                {image && 
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="rounded-full relative size-[20px] overflow-hidden"
                    >
                        <Image alt="" fill src={image} /> 
                    </motion.div>
                }
                <span>{name ?? role}</span>
            </div>
        </div>
    );
}

const Header = memo(PureHeader, (prev, next) => {
    if (prev.image !== next.image) return false;
    if (prev.name !== next.name) return false;
    if (prev.role !== next.role) return false;
    return true;
});

const PureFooter = (props: { openImageGen?: () => void; message: MessageType, chatId: string, deleteCallback: (messageId: string) => void }) => {
    const [state, setState] = useState<"init" | "deleting" | "editing" | "copying" | "generating-image" | "listening">("init");

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2"
        >
            {/* <ClockIcon className="size-[12px]" /> */}
            {/* {prettyPrintDate(new Date())} */}
            
            <Button disabled size={"icon"} variant={"ghost"} >
                <EditIcon color="currentColor" />
            </Button>

            <Button 
                disabled={state === "deleting"}
                size={"icon"} 
                variant={"ghost"} 
                onClick={async () => {
                    const messageId = getMessageIdFromAnnotations(props.message);
                
                    setState("deleting");
                    const deleteResponse = fetch(API_ROUTES.DELETE_MESSAGE + messageId + "&chatId=" + props.chatId, {
                        method: "DELETE"
                    }).finally(() => {
                        setState("init");
                    });

                    toast.promise(deleteResponse, {
                        loading: "Deleting message...",
                        success: () => {
                            props.deleteCallback?.(messageId);
                            return "Message deleted successfully.";
                        },
                        error: "Failed to delete message."
                    });
                }}
            >
                {state === "deleting" ? 
                    <span className="animate-spin"> 
                        <TrashIcon color="currentColor" />
                    </span>
                    :
                    <TrashIcon color="currentColor" />
                }
            </Button>

            <Button size={"icon"} variant={"ghost"} onClick={() => {
                setState("copying");
                navigator.clipboard.writeText(props.message.content).finally(() => {
                    toast.success("Message copied to clipboard: ", {
                        duration: 3000,
                        description: "You can use this ID to reference the message in the future."
                    });
                    setState("init");
                });
            }} >
                {state === "copying" ? 
                    <span className="animate-spin"> 
                        <CopyIcon color="currentColor" />
                    </span>
                    :
                    <CopyIcon color="currentColor" />
                }
            </Button>

            {props.openImageGen && 
            <Button onClick={props.openImageGen} size={"icon"} variant={"ghost"} >
                <ImageIcon color="currentColor" />
            </Button>
            }

            <Button disabled size={"icon"} variant={"ghost"} >
                <VolumeIcon color="currentColor" />
            </Button>
            
        </motion.div>
 
    )
}

const Footer = memo(PureFooter, (prev, next) => {
    if (prev.openImageGen !== next.openImageGen) return false;
    if (!equal(prev.message, next.message)) return false;
    return true;
});

const PureAIContent = ({ message: { parts} }: { message: UIMessage }) => {


    if (!parts || parts.length === 0) {
        return null; // No content to render
    }

    return (
        <>
        {parts.map((part, index: number) => {
            if(part.type === "step-start") {
                return null; // Skip step-start parts
            }

            if (part.type === "text") {
                return (
                    <div key={part.text} >
                        <Markdown key={index}>{part.text}</Markdown>
                    </div>
                );
            }

            if(part.type === "tool-invocation") {
                const callId = part.toolInvocation?.toolCallId;

                switch(part.toolInvocation?.toolName) {
                    case TOOL_NAMES.addMemory:
                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                                return (
                                    <div key={callId} className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Adding memory...</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">{part.toolInvocation?.args?.memory}</span>
                                    </div>
                                )
                            case "call":
                                return (
                                    <div key={callId}>
                                        <span>{part.toolInvocation?.args.memory}</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">Adding memory...</span>
                                    </div>
                                )
                            case "result":
                                return (
                                    <div key={callId} className="bg-green-100 dark:bg-green-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Memory added successfully!</span>
                                    </div>
                                )
                        }

                    case TOOL_NAMES.generateImage:
                    case "image-gen":
                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                                return (
                                    <div key={callId} className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Adding memory...</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">{part.toolInvocation?.args?.memory}</span>
                                    </div>
                                )
                            case "call":
                                return (
                                    <div key={callId}>
                                        <span>{part.toolInvocation?.args.memory}</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">Adding memory...</span>
                                    </div>
                                )
                            case "result":
                                if (!part.toolInvocation?.result) {
                                    return (
                                        <div key={callId} className="bg-red-100 dark:bg-red-800 p-2 rounded-md mb-2">
                                            <span className="font-semibold">Image generation failed</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={callId} className="p-2 w-full flex flex-col gap-2">
                                        <div className="h-[250px] overflow-hidden relative rounded-3xl">
                                            <Image 
                                                src={part.toolInvocation.result} 
                                                alt={part.toolInvocation.args.prompt || "Generated Image"}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        {/* <span className="text-xs text-muted-foreground">{part.toolInvocation?.args?.prompt}</span> */}
                                    </div>
                                )
                        }

                    default:
                        return (   
                            <div key={`unhandled-${index}-${callId}-${part.toolInvocation.toolName}`} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md mb-2">
                                <span className="font-semibold">Unhandled Tool invocation: {part.toolInvocation?.toolName}</span>
                                <span className="text-neutral-500 dark:text-neutral-400">{JSON.stringify(part.toolInvocation)}</span>
                            </div>
                        );
                }
            }

            return (
                <div key={index} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md mb-2">
                    <span className="font-semibold">Unknown part type: {part.type}</span>
                    <span className="text-neutral-500 dark:text-neutral-400">{JSON.stringify(part)}</span>
                </div>
            );
            
        })}


        </>
    )

}

const AIContent = memo(PureAIContent, (prev, next) => {
    if (prev.message.id !== next.message.id) return false;
    if (prev.message?.parts.length !== next.message?.parts.length) return false;
    if (JSON.stringify(prev.message?.parts) !== JSON.stringify(next.message?.parts)) return false;
    if( prev.message.content !== next.message.content) return false;
    if (JSON.stringify(prev.message.toolInvocations) !== JSON.stringify(next.message.toolInvocations)) return false;
    return false;
});

const PureAIMessage = ({ message, name, image }: 
    { message: UIMessage, name?: string, image?: string, isLoading: boolean }) => {

    return (
        <div className="flex flex-col gap-2 p-1">

            <Header image={image} name={name} role={message.role} />

            <AIContent message={message} />
        </div>
    );
}

const AIMessage = memo(PureAIMessage, (prev, next) => {
    if( !equal(prev.message?.parts, next.message?.parts)) return false;
    if( prev.message.role !== next.message.role) return false;
    if( prev.message.id !== next.message.id) return false;
    if( prev.name !== next.name) return false;
    if( prev.image !== next.image) return false;

    return true;
});

const PureUserMessage = ({ message }: { message: UIMessage }) => {
    return (
        <div className="text-slate-100 dark:bg-slate-800 rounded-3xl rounded-tr-none p-3">
            {/* <Markdown>{message.content}</Markdown> */}
            {message.parts && message.parts.length > 0 && message.parts.map((part, index) => {
                if(part.type === "text") {
                    return <Markdown key={index}>{part.text}</Markdown>;
                }

                return (
                    <div key={index} className=" p-2 rounded-md mb-2">
                        <span className="font-semibold">Unknown part type: {part.type}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">{JSON.stringify(part)}</span>
                    </div>
                );
            })}
        </div>
    );
}

const UserMessage = memo(PureUserMessage, (prev, next) => {
    if( prev.message.content !== next.message.content) return false;
    if( prev.message.role !== next.message.role) return false;
    if( prev.message.id !== next.message.id) return false;
    if (JSON.stringify(prev.message?.parts) !== JSON.stringify(next.message?.parts)) return false;

    return true;
});

type MessageProps = {
    message: UIMessage;
    isLoading: boolean;
    characterName?: string;
    characterImage?: string;
    openImageGen: () => void;
    deleteCallback: (messageId: string) => void;
    chatId: string;
    status: "submitted" | "streaming" | "ready" | "error";
    latestMessage: boolean;
}

const PureMessage = (props: MessageProps) => {

    const showLoading = useMemo(() => {
        return props.isLoading && props.message.role === "assistant" && props.status === "streaming";
    }, [props.isLoading, props.message.role, props.status]);

    if(props.message.content === _INTRO_MESSAGE_PLACEHOLDER) {
        return null; // don't render the intro message
    }

    return (
        <div id={props.message.id} className={cn("w-full flex flex-col mb-4 relative", {
            "items-end": props.message.role === "user",
        })}>
            {props.message.role === "user" ? 
                (
                    <UserMessage message={props.message} />
                ) 
                : (
                    <AIMessage 
                        message={props.message} 
                        name={props.characterName} 
                        image={props.characterImage} 
                        isLoading={props.isLoading}
                    />
                )
            }

            {showLoading && false &&
                <div className="flex items-center gap-2 mt-2">
                    <div className="size-3 border border-sky-200/50 shadow shadow-sky-200 bg-gradient-to-r from-transparent to-sky-200/50 rounded-full animate-spin"></div>
                    <span className="text-xs text-neutral-500 dark:text-sky-200/50">Generating response...</span>
                </div>  
            }

            {showLoading && <div className="absolute bottom-0 left-0 w-full h-[75%] bg-gradient-to-t from-background to-transparent z-10 pointer-events-none">

            </div>}


            {!showLoading && 
                <Footer 
                    message={props.message} 
                    chatId={props.chatId} 
                    openImageGen={props.openImageGen} 
                    deleteCallback={props.deleteCallback} 
                />
            }
        </div>
    )


}

export const Message = memo(PureMessage, (prev, next) => {
    if( prev.isLoading !== prev.isLoading) return false;
    if( prev.message.content !== next.message.content) return false;
    if( !equal(prev.message?.parts, next.message?.parts)) return false;
    if( prev.characterName !== next.characterName) return false;
    if( prev.characterImage !== next.characterImage) return false;
    if (prev.status !== next.status) return false;
    
    return true;

}); 