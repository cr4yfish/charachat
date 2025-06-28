import { Message as MessageType, UIMessage } from "ai";
import Image from "next/image";
import { memo, useMemo, useState } from "react";
import { Markdown } from "../ui/markdown";
import { Button } from "../ui/button";
import { CheckIcon, CopyIcon, EditIcon, ImageIcon, LogInIcon, TrashIcon, VolumeIcon } from "lucide-react";
import { motion } from "motion/react";
import { _INTRO_MESSAGE_PLACEHOLDER } from "@/lib/constants/defaults";
import { TOOL_NAMES } from "@/lib/constants/toolNames";
import equal from 'fast-deep-equal';
import { cn } from "@/lib/utils";
import { getMessageIdFromAnnotations } from "@/lib/utils/message";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { toast } from "sonner";
import { SignInButton } from "@clerk/nextjs";
import { safeParseLink } from "@/lib/utils/text";
import { ReasoningBlock } from "./reasoning-block";
import { Character } from "@/lib/db/types/character";
import ImageCharacterCard from "../character/character-card-image";
import APIKeyInput from "../settings/api-key-input";
import LLMSelect from "./llm-select";
import { TextModelId } from "@/lib/ai/models/llm";

const PureHeader = ({ image, name}: { image?: string, name?: string, role: string }) => {
    return (
        <div className="font-medium text-sm flex items-center gap-2">
            <div className="flex items-center gap-2 dark:text-neutral-400 text-neutral-600">
                {image && 
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="rounded-full relative size-[20px] overflow-hidden"
                    >
                        <Image alt="" fill src={safeParseLink(image)} /> 
                    </motion.div>
                }
                <span>{name ?? "Charachat"}</span>
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

const PureFooter = (props: { openImageGen?: () => void; message: MessageType, chatId?: string, deleteCallback?: (messageId: string) => void }) => {
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
            
            {/* Editing only available in a chat */}
            {props.chatId &&
            <Button disabled size={"icon"} variant={"ghost"} >
                <EditIcon color="currentColor" />
            </Button>
            }

            {props.deleteCallback && 
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
            }

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

            {/* Voice only available with a chat */}
            {props.chatId &&
            <Button disabled size={"icon"} variant={"ghost"} >
                <VolumeIcon color="currentColor" />
            </Button>
            }
            
        </motion.div>
 
    )
}

const Footer = memo(PureFooter, (prev, next) => {
    if (prev.openImageGen !== next.openImageGen) return false;
    if (!equal(prev.message, next.message)) return false;
    return true;
});

const PureAIContent = ({ message: { parts}, addToolResult }: { message: UIMessage, addToolResult?: ({ toolCallId, result, }: {
    toolCallId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
}) => void }) => {


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

            if (part.type === "reasoning") {
                return (
                    <ReasoningBlock key={index}>
                        {part.details.map((detail) => detail.type === "text" ? detail.text : null)}
                    </ReasoningBlock>
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
                                                src={safeParseLink(part.toolInvocation.result)} 
                                                alt={part.toolInvocation.args.prompt || "Generated Image"}
                                                fill
                                                className="object-cover rounded-md"
                                            />
                                        </div>
                                        {/* <span className="text-xs text-muted-foreground">{part.toolInvocation?.args?.prompt}</span> */}
                                    </div>
                                )
                        }

                    case TOOL_NAMES.login: {
                        return (
                            <div key={callId} className="flex flex-col">
                                <Markdown>
                                    {(() => {
                                        const variants = [
                                            "Oh honey, looks like you're trying to sneak into the VIP section without a ticket! 🎭 I'd love to spill all the tea with you, but first you gotta show me some ID. Click that shiny button below and let's make this official! ✨",
                                            "Whoops! Looks like you're browsing incognito mode in real life! 🕵️ I'm dying to chat, but I need to know who I'm talking to first. Hit that sign-in button and let's get this party started! 🎉",
                                            "Hold up, mysterious stranger! 👻 I'd love to dive deep into conversation, but I need you to introduce yourself properly first. Click below to sign in and unlock the full experience! 🔓",
                                            "Well well well, what do we have here? 🤔 A ghost trying to chat! I'm all for supernatural encounters, but I need you to materialize first. Sign in below and let's make some magic happen! ✨",
                                            "Error 404: User not found! 🤖 I'm having an existential crisis here - am I talking to myself? Please sign in so I can confirm you're not just a figment of my imagination! 🤯",
                                            "HALT! You shall not pass... without logging in first! 🧙‍♂️ I'm not Gandalf, but I do know you need credentials to enter this realm. Click the magical button below! ⚡",
                                            "Beep boop! 🚨 Anonymous user detected! My security protocols are going crazy right now. Please identify yourself before I call the digital police! 👮‍♀️",
                                            "Hey there, John Doe! 😏 Oh wait, that's not your real name, is it? I see right through your disguise! Time to drop the act and sign in like the rest of us mortals. 🎭",
                                            "I'm not saying you're sus, but... you're kinda sus. 👀 Among us players know what I mean! Prove you're not an impostor by signing in below! 🚀",
                                            "Knock knock! Who's there? ...Nobody apparently! 😅 This is awkward. Please sign in so I know who I'm delivering my amazing jokes to! 🎪",
                                            "Breaking news: Local AI refuses to chat with mysterious entity! 📺 More at 11... or right now if you just sign in! I promise I don't bite (I don't even have teeth)! 🦷",
                                            "You're like a ninja, but in the worst way possible - completely invisible to my systems! 🥷 Time to drop the stealth mode and reveal yourself, warrior! ⚔️"
                                        ];
                                        return variants[Math.floor(Math.random() * variants.length)];
                                    })()}
                                </Markdown>
                                <motion.div 
                                    className="p-2 text-sky-400 flex items-center relative overflow-hidden"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ 
                                        scale: [0, 1.2, 0.9, 1.1, 1],
                                        rotate: [-180, 360, -45, 180, 0],
                                        y: [0, -10, 5, -5, 0]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        ease: "easeInOut",
                                        times: [0, 0.3, 0.6, 0.8, 1]
                                    }}
                                    whileTap={{ scale: 0.8 }}
                                >
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ 
                                            x: 0, 
                                            opacity: 1,
                                            rotate: [0, 5, -5, 3, -3, 0]
                                        }}
                                        transition={{ 
                                            delay: 0.5,
                                            rotate: { duration: 2, repeat: Infinity }
                                        }}
                                    >
                                        <LogInIcon className="mr-2 h-4 w-4 drop-shadow-lg filter brightness-150" />
                                    </motion.div>
                                    
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="relative z-10"
                                    >
                                        <SignInButton />
                                    </motion.div>
                                </motion.div>
                                
                            </div>
                        )
                    }

                    case TOOL_NAMES.searchChars: {
                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                                return (
                                    <div key={callId} className="bg-yellow-100 dark:bg-yellow-800 p-2 rounded-md mb-2">
                                        <span className="font-semibold">Searching characters...</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">{part.toolInvocation?.args?.query}</span>
                                    </div>
                                )
                            case "call":
                                return (
                                    <div key={callId}>
                                        <span>{part.toolInvocation?.args.query}</span>
                                        <span className="text-neutral-500 dark:text-neutral-400">Searching characters...</span>
                                    </div>
                                )

                            case "result":
                                if (!part.toolInvocation?.result) {
                                    return (
                                        <div key={callId} className="bg-red-100 dark:bg-red-800 p-2 rounded-md mb-2">
                                            <span className="font-semibold">Character search failed</span>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={callId} className="p-2 w-full flex flex-col gap-2">
                                        <span className="font-semibold">Found {part.toolInvocation.result.length} characters:</span>
                                        <ul className="flex flex-row overflow-x-auto w-full gap-2">
                                            {part.toolInvocation.result.map((character: Character) => (
                                                <ImageCharacterCard data={character} key={character.id} />
                                            ))}
                                        </ul>
                                    </div>
                                )
                        }
                    }

                    case TOOL_NAMES.manageProviderTokens: {

                        const callback = () => {
                            if(!addToolResult) return;

                            if(!part.toolInvocation.toolCallId) {
                                throw new Error("Tool invocation does not have a toolCallId")
                            }
                            addToolResult({
                                toolCallId: part.toolInvocation.toolCallId,
                                result: "done"
                            })
                        }

                        const isDone = part.toolInvocation?.state === "result";

                        switch(part.toolInvocation?.state) {
                            case "partial-call":
                            case "call":
                            case "result":
                                return (
                                    <div key={callId} className="flex flex-col gap-4">
                                        <span className="text-xs text-muted-foreground mb-2">Manage your {part.toolInvocation?.args?.provider} API Key</span>
                                        <APIKeyInput providerId={part.toolInvocation?.args?.provider} />
                                        <div className="flex w-fit"> 
                                            <Button disabled={isDone} variant={"secondary"} className={cn("", { "bg-emerald-400": isDone })} onClick={callback}>
                                                {isDone && <span><CheckIcon /></span>}
                                                Done
                                            </Button>
                                        </div> 
                                    </div>
                                )

                        }
                    }

                    case TOOL_NAMES.chooseModel: {
                        return (
                            <div id={callId} key={callId} className="max-w-lg">
                                <LLMSelect 
                                    label="You need to select a model to continue"
                                    description="Please select a model to use for this chat. You can change it later in the settings."
                                    showLink isLoading={false} selectedKey={undefined}
                                />
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

const PureAIMessage = ({ message, name, image, addToolResult }: 
    { message: UIMessage, name?: string, image?: string, isLoading: boolean, addToolResult?: ({ toolCallId, result, }: {
    toolCallId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
}) => void }) => {

    return (
        <div className="flex flex-col gap-2 p-1">

            <Header image={image} name={name} role={message.role} />

            <AIContent message={message} addToolResult={addToolResult} />
        </div>
    );
}

const AIMessage = memo(PureAIMessage, (prev, next) => {
    if( !equal(prev.message?.parts, next.message?.parts)) return false;
    if( prev.message.role !== next.message.role) return false;
    if( prev.message.id !== next.message.id) return false;
    if( prev.name !== next.name) return false;
    if( prev.image !== next.image) return false;
    if( prev.addToolResult !== next.addToolResult) return false;

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
    openImageGen?: () => void;
    deleteCallback?: (messageId: string) => void;
    chatId?: string;
    status: "submitted" | "streaming" | "ready" | "error";
    latestMessage: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToolResult?: ({ toolCallId, result, }: { toolCallId: string; result: any; }) => void
}

const PureMessage = (props: MessageProps) => {

    const showLoading = useMemo(() => {
        return props.isLoading && props.message.role === "assistant" && props.status === "streaming";
    }, [props.isLoading, props.message.role, props.status]);

    if(props.message.content === _INTRO_MESSAGE_PLACEHOLDER) {
        return null; // don't render the intro message
    }

    return (
        <div id={props.message.id} className={cn("w-full overflow-hidden flex flex-col pb-4 relative", {
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
                        addToolResult={props.addToolResult}
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
    if (prev.addToolResult !== next.addToolResult) return false;
    
    return true;

}); 