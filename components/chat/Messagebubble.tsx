"use client";

import { v4 as uuidv4 } from "uuid";
import { Message as AIMessage } from "ai/react";
import { Spinner } from "@nextui-org/spinner";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { framerListAnimationProps, sleep } from "@/lib/utils";

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
import { ChatRequestOptions, Message } from "ai";
import { ContextMenuSeparator } from "@radix-ui/react-context-menu";
import Icon from "../utils/Icon";
import { addMessage, updateMessage } from "@/functions/db/messages";
import { Textarea } from "@nextui-org/input";
import { Button } from "../utils/Button";
import { Avatar } from "@nextui-org/avatar";
import { decryptMessage, getKeyClientSide } from "@/lib/crypto";
import ImagePrompterDrawer from "../ImagePrompterDrawer";

type Prediction = {
    id: string;
    model: string;
    input : {
        language: string;
        speaker: string;
        text: string;
    },
    logs: string;
    output: string;
    data_removed: boolean;
    error: string | null;
    status: string;
    created_at: string;
    started_at: string;
    urls: {
        cancel: string;
        get: string;
        stream: string
    }
}

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
    reloadMessages: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
    setCurrentMessage: (message: AIMessage | null) => void;
    setSelectionMode: (selectionMode: boolean) => void;
    selectionMode: boolean;
    selectedMessageIDs: string[];
    setSelectedMessageIDs: (ids: string[]) => void;
    isDeleting: boolean;
}

export default function Messagebubble(props: Props) {
    const { toast } = useToast();

    const [id, setId] = useState<string | undefined>(undefined);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingLoading, setIsSavingLoading] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const [imageLink, setImageLink] = useState<string | null>(null);
    const [imagePrompt, setImagePrompt] = useState<string>("");
    const [imagePromptLoading, setImagePromptLoading] = useState(false);

    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioLink, setAudioLink] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [audioPrediction, setAudioPrediction] = useState<Prediction | null>(null);

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

    useEffect(() => {
        if(audioLink) {
            handlePlayAudio();
        }
    }, [audioLink])

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(props.message.content).then(() => {
            toast({
                title: "Copied to clipboard",
            })
        })
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
            
            if(!props.chat.character.speaker_link) {
                throw new Error("Speaker link is not available. Please add it to your character to use this tool.")
            }

            const key = getKeyClientSide();
            const keyBuffer = Buffer.from(key, "hex");
            const encryptedReplicateKey = props.user.replicate_encrypted_api_key;
            if(!encryptedReplicateKey) {
                throw new Error("Replicate API keys are not available. Please add them to your profile to use this tool.")
            }

            const decryptedSpeakerLink = decryptMessage(props.chat.character.speaker_link, keyBuffer);
            const decryptedReplicateKey = decryptMessage(encryptedReplicateKey, keyBuffer);

            toast({
                title: "Generating audio",
                description: "This may take a few seconds"
            })

            const res = await fetch("/api/audio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: props.message.content,
                    speakerLink: decryptedSpeakerLink,
                    replicateToken: decryptedReplicateKey,
                }),
            });

            if(res.status !== 201) {
                throw new Error("Failed to generate audio");
            }
            
            let prediction = await res.json();
            setAudioPrediction(prediction);

            while(
                prediction.status !== "succeeded" &&
                prediction.status !== "failed"
            ) {
                await sleep(1000);
                const response = await fetch(`/api/audio/${prediction.id}`, {
                    headers: {
                        Authorization: decryptedReplicateKey
                    }
                });
               prediction = await response.json();
               if(response.status !== 200) {
                    throw new Error("Failed to get audio prediction");
               }
               
               if(prediction.output && prediction.output.length > 0) {
                setAudioLink(prediction.output);
                setIsLoadingAudio(false);
               }
               setAudioPrediction(prediction);
            }
            
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

    const handleOnTap = async () => {
        if(props.isDeleting || isEditMode) { return; }

        const isSelected = props.selectedMessageIDs.includes(props.message.id);

        const addToSelection = async () => {
            props.setSelectedMessageIDs([...props.selectedMessageIDs, props.message.id]);
        }

        const removeFromSelection = async () => {
            props.setSelectedMessageIDs(props.selectedMessageIDs.filter((id) => id !== props.message.id));
        }

        if(props.selectionMode) {
            if(props.selectedMessageIDs.length === 1 && isSelected) {
                props.setSelectionMode(false);
                props.setSelectedMessageIDs([]);
            }
        } else {
            props.setSelectionMode(true);
        }

        if(isSelected) {
            removeFromSelection();
        } else {
            addToSelection();
        }
        
    }

    const handleGenerateImagePrompt = async () => {
        if(!props.user) return;
        if(imagePrompt && imagePrompt.length > 0) {
            return;
        }

        setImagePromptLoading(true);
        toast({
            title: "Generating image Prompt",
            description: "This may take a few seconds"
        })

        const lastMessage = props.messages[props.index-1];
        const messageBeforeLast = props.messages[props.index-2];

        const context = `
            2 messages ago:
            ${messageBeforeLast?.role == "user" ? "User" : "Character"}: ${messageBeforeLast?.content}

            Previous message: 
            ${lastMessage?.role == "user" ? "User" : "Character"}: ${lastMessage?.content}

            This message:
            ${props.message.role == "user" ? "User" : "Character"}: ${props.message.content}
        `;

        const res = await fetch("/api/author/image/prompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messageContent: context,
                characterDescription: props.chat?.character.description,
                profile: props.user
            }),
        })

        if(res.status !== 200) {
            const err = await res.json();
            toast({
                title: "Failed to generate image",
                description: err.error,
                variant: "destructive",
            })
            return;
        }

        type Result = {
            result: {
                text: string
            }
        }

        const data: Result = await res.json();

        // replace username with "viewer"
        data.result.text = data.result.text.replaceAll(props.chat?.persona?.full_name ?? props.chat?.user.username ?? "", "viewer")

        if(props.chat?.character.image_prompt) {
            setImagePrompt(props.chat?.character.image_prompt + ", " + data.result.text);
        } else {
            setImagePrompt(data.result.text);
        }
        
        setImagePromptLoading(false);
    }

    const handleAddImageToChat = async () => {
        const newMessage: Message = {
            id: uuidv4(),
            content: `![image](${imageLink})`,
            role: "assistant",
            createdAt: new Date()
        }

        if(imageLink?.includes(".mp4")) {
            newMessage.content = `<video width="320" height="240" controls>
                <source src=${imageLink} type="video/mp4">
                Your browser does not support the video tag.
            </video>`;
        }

        props.setMessages((messages) => [...messages, newMessage]);
        props.setCurrentMessage(newMessage);

        try {
            if(!props.chat || !props.chat.character || !props.user) {
                return;
            }

            const key = getKeyClientSide();
            await addMessage({
                id: newMessage.id,
                chat: props.chat,
                character: props.chat?.character,
                user: props.user,
                content: newMessage.content,
                from_ai: true,
            }, key)
            
        } catch (error) {
            console.error(error);
            const err = error as Error;
            toast({
                title: "Failed to add image to chat",
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
                        onClick={handleOnTap}
                        
                        className={`!select-none relative w-fit ${isEditMode && "z-50"} `}
                    >
                        {props.showName &&
                            <div className={`pl-3 pb-1 flex flex-row items-center gap-2 ${props.message.role === "user" && "justify-end"}`}>
                                <span className={`text-sm select-none flex items-center gap-2 ${props.message.role === "user" && "flex-row-reverse"}`}>
                                    <Avatar 
                                        size="sm" 
                                        className="w-[20px] h-[20px]"
                                        src={props.message.role === "user" ? (props.chat?.persona?.avatar_link || props.chat?.user.avatar_link) : props.chat?.character.image_link} 
                                    />
                                    {props.message.role === "user" ? (props.chat?.persona?.full_name || props.chat?.user.username) : props.chat?.character.name}
                                </span>
                                {props.chat && props.message.role === "assistant" &&
                                    <div className="flex flex-row items-center gap-1 px-2 py-1  w-fit rounded-full text-xs text-zinc-400  dark:text-zinc-400">
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
                                ${(isEditMode || props.selectedMessageIDs.includes(props.message.id)) && " dark:bg-amber-400/10"}
                                `}
                        >
                            {props.isDeleting &&
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                    <span className="z-10 text-danger text-xs"><Spinner color="danger" size="sm" /></span>
                                    <div className="absolute top-0 left-0 w-full h-full backdrop-blur-sm rounded-3xl"></div>
                                </div>
                            }
                            
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
                                        maxRows={20}
                                        className="w-full"
                                        classNames={{
                                            base: "bg-transparent dark:bg-transparent !focus:bg-transparent w-full min-w-[600px] max-lg:min-w-[500px] max-md-min-w-[400px] max-sm:min-w-[300px] relative",
                                            inputWrapper: "bg-transparent !dark:bg-transparent !focus:bg-transparent group-data-[focus=true]:bg-trasnparent data-[hover=true]:bg-transparent w-full relative",
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
                            <Button onClick={handleSetEditMode} isDisabled={props.isDeleting} variant="light" isIconOnly size="sm">
                                <Icon downscale color="zinc-400" >edit</Icon>
                            </Button>
                            <Button onClick={handleCopyToClipboard} variant="light" isDisabled={props.isDeleting} isIconOnly size="sm">
                                <Icon downscale color="zinc-400" >content_copy</Icon>
                            </Button>
                            <ImagePrompterDrawer 
                                imageLink={imageLink}
                                saveImage={handleAddImageToChat}
                                setImageLink={setImageLink}
                                initPromptLoading={imagePromptLoading}
                                initImagePrompt={imagePrompt}
                                trigger={
                                    <Button 
                                        isDisabled={props.isDeleting}
                                        onClick={handleGenerateImagePrompt} 
                                        variant="light" 
                                        isIconOnly 
                                        size="sm"
                                    >
                                        <Icon downscale color="zinc-400" >image</Icon>
                                    </Button>
                                }
                            />
                            {props.message.role === "assistant" &&
                                <Button 
                                    isLoading={isLoadingAudio} 
                                    isDisabled={props.isDeleting}
                                    onClick={() => {
                                        if(isAudioPlaying) {
                                            handleStopAudio();
                                        } else {
                                            handlePlayAudio();
                                        }
                                    }} 
                                    variant="light" 
                                    isIconOnly={false} 
                                    size="sm"
                                    className=" text-zinc-400 dark:text-zinc-400 px-2"
                                >
                                    {<Icon color="zinc-400" downscale >{!isAudioPlaying ? "mic" : "stop"}</Icon>}
                                    {audioPrediction?.status == "starting" && "Starting"}
                                    {audioPrediction?.status == "processing" && "Generating"}
                                    {audioPrediction?.status == "succeeded" && "Play"}
                                    {audioPrediction == null && "Generate"}
                                </Button>
                            }

                        </div>
                        
                    </motion.div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64 flex flex-col">
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={handleCopyToClipboard} >
                        Copy
                        <Icon>content_copy</Icon>
                    </ContextMenuItem>
                        <ContextMenuItem onClick={handleSetEditMode}  className="dark:text-amber-400" >
                        Edit
                        <Icon>edit</Icon>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        </div>
        </>
    )
}