"use client";

import { useState } from "react";
import Image from "next/image";
import { ToolInvocation, Message as AIMessage } from "ai";
import { v4 as uuidv4 } from "uuid"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getKeyClientSide } from "@/lib/crypto";
import { addMessage } from "@/functions/db/messages";
import { Chat, Profile, Message } from "@/types/db";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/utils/Button";
import { isValidURL, safeParseLink } from "@/lib/utils";
import { uploadImageToImgur } from "@/functions/ai/image";

type Props = {
    toolInvocation: ToolInvocation,
    chat: Chat | null,
    user: Profile,
    setMessages: (messages: AIMessage[] | ((messages: AIMessage[]) => AIMessage[])) => void,
}

export default function GenerateImageTool(props: Props) {
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [videoLink, setVideoLink] = useState<string | undefined>(undefined);
    const [isAddedToChat, setIsAddedToChat] = useState(false);
    const [isAddingImageToChat, setIsAddingImageToChat] = useState(false);
    const { toast } = useToast();
    
    if(isAddedToChat) return null;

    if("result" in props.toolInvocation) {

        if(!isValidURL(props.toolInvocation.result)) {            
            return (
                <Alert 
                    key={props.toolInvocation.toolCallId} 
                    className="dark:bg-danger/5"
                    variant={"destructive"}
                >
                    <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                        Error generating the image.
                    </AlertTitle>
                    <AlertDescription>
                        {props.toolInvocation.result}
                    </AlertDescription>
                </Alert>
            );
        }

        // create new message with image
        const newMessage: AIMessage = {
            id: "image-" + props.toolInvocation.toolCallId,
            role: "assistant",
            content: `![Generated Image](${props.toolInvocation.result})`,
            createdAt: new Date(),
        }

        const handleAddMessage = async () => {
            if(!props.chat || !props.user) return;
            if(!("result" in props.toolInvocation)) return;

            setIsAddingImageToChat(true);
        
            // we need to download the image from replicate
            // and upload it to imgur, then save the imgur link
            // in the message content
            const res = await fetch(props.toolInvocation.result)

            if(!res.ok) {
                toast({
                    title: "Failed to download image",
                    description: "Failed to download image from replicate",
                    variant: "destructive",
                })
                return;
            }

            const blob = await res.blob();
            const base64 =  (await blob.arrayBuffer().then((buffer) => Buffer.from(buffer).toString("base64")));
            const link = await uploadImageToImgur(base64);

            // update the message in the chat
            newMessage.content = `![Generated Image](${link})`;
            props.setMessages((messages) => [...messages, newMessage]);

            const message: Message = {
                id: uuidv4(),
                chat: props.chat,
                character: props.chat.character,
                user: props.user,
                from_ai: true,
                content: `![Generated Image](${link})`,
            }

            // save the message to DB
            try {
                const key = getKeyClientSide();
                await addMessage(message ,key);
            } catch(e) {
                console.error(e);
                toast({
                    title: "Failed to save image in chat",
                    description: "Failed to save image in chat",
                    variant: "destructive",
                })
            }
      
            setIsAddedToChat(true);
            setIsAddingImageToChat(false);
        }

        const handleGenerateVideo = async () => {
            if(!("result" in props.toolInvocation)) return;

            setIsVideoGenerating(true);
            try {

                const res = await fetch("/api/video", {
                    method: "POST",
                    body: JSON.stringify({ imageLink: props.toolInvocation.result, prompt: props.toolInvocation.args.text }),
                })

                if(!res.ok) {
                    throw new Error("Failed to generate video");
                }

                const { link } = await res.json();

                setVideoLink(link);
                setIsAddedToChat(true);

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
                id: "video-" + props.toolInvocation.toolCallId,
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
            }

            try {
                const key = getKeyClientSide();
                await addMessage(message ,key);
            } catch(e) {
                console.error(e);
                toast({
                    title: "Failed to save video in chat",
                    description: "Failed to save video in chat",
                    variant: "destructive",
                })
            }
    
        }

        return (
            <div key={props.toolInvocation.toolCallId} className="w-full h-full">
                <div className="flex flex-col items-center gap-2">
                    <Image src={safeParseLink(props.toolInvocation.result)} alt="" width={200} height={200} className=" rounded-xl" />
                    {videoLink && <video src={videoLink} controls className="rounded-xl" width={200} />}
                    <div className="flex flex-col gap-2">
                        <p className="dark:text-zinc-400 text-xs max-w-xs">{props.toolInvocation.args.text}</p>
                        <Button isLoading={isAddingImageToChat} variant="flat" color="secondary" onClick={handleAddMessage}>Save in chat</Button>
                        {!videoLink && <Button isLoading={isVideoGenerating} variant="flat" color="secondary" onClick={handleGenerateVideo}>Generate Video</Button>}
                        {videoLink && <Button variant="flat" color="secondary" onClick={handleSaveVideo}>Save Video</Button>}
                    </div>
                </div>
            </div>
        )

    }

    return (
        <Alert key={props.toolInvocation.toolCallId} className=" dark:bg-transparent ">
            <AlertTitle className="flex items-center gap-2 dark:prose-invert">
                <Spinner size="sm" />
                <p className=" dark:text-zinc-400 ">Generating an image...</p>
            </AlertTitle>
        </Alert>
    )
    
}