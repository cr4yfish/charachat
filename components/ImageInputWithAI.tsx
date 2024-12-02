"use client";

import { Input } from "@nextui-org/input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./utils/Button";
import { useRef, useState } from "react";
import Icon from "./utils/Icon";
import { isValidURL, safeParseLink } from "@/lib/utils";
import { Avatar } from "@nextui-org/avatar";


type Props = {
    contextFields: string[];
    imageLink: string | undefined;
    setImageLink: (link: string) => void;
    disableAI?: boolean;
}

export default function ImageInputWithAI(props: Props) {
    const [isGenerateLoading, setIsGenerateLoading] = useState(false);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const { toast } = useToast();

    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateImage = async () =>  {
        setIsGenerateLoading(true);

        try {
            const res = await fetch("/api/image", {
                method: "POST",
                body: JSON.stringify({
                    contextFields: props.contextFields
                })
            })
    
            if(res.status === 200) {
                const { link } = await res.json();
                if(!link) {
                    throw new Error("Got no image link from the server");
                }
                handleSetImageLink(link);
            } else {
                const text = await res.text();
                console.error("Text:",text);
                throw new Error("Failed to generate image. Error Message: " + text);
            }
        } catch(e) {
            const err = e as Error;
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

        setIsGenerateLoading(false);
    }

    const handleSetImageLink = async (imageLink: string) => {

        if(!isValidURL(imageLink) || !imageLink.includes("https://")) {
            toast({
                title: "Error",
                description: "Invalid image link. Make sure it starts with https:// and ends with .jpg/.png or another image extension",
                variant: "destructive"
            })
            return;
        }

        props.setImageLink(imageLink);
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file) return;

        setIsUploadLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/image/upload", {
                method: "POST",
                body: formData
            });

            if(res.status === 200) {
                const { link } = await res.json();
                if(!link) {
                    throw new Error("Got no image link from the server");
                }
                handleSetImageLink(link);
            } else {
                throw new Error("Failed to upload image");
            }
        } catch(e) {
            const err = e as Error;
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

        setIsUploadLoading(false);
    }
    
    return (
        <>
        <div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Avatar className="min-w-[50px] h-[50px]" src={safeParseLink(props.imageLink)} alt="" />
                    <Input 
                        name="image_link"
                        label="Image Link" 
                        placeholder="https://i.imgur.com/XgbZdeAb.jpg" 
                        value={props.imageLink}
                        onValueChange={handleSetImageLink}
                    />
                </div>
                <p className="text-xs dark:text-zinc-400">{`Paste an image link (ending on .jpg/.png) ${!props.disableAI ? ", generate an image with AI" : ""} or upload one from your Phone/PC`}</p>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
                {!props.disableAI &&
                    <Button 
                        isLoading={isGenerateLoading} 
                        onClick={handleGenerateImage} 
                        variant="light" color="primary" 
                        startContent={<Icon>auto_awesome</Icon>}
                    >
                        Generate Image
                    </Button>
                }
                <Button
                    onClick={() => imageInputRef.current?.click()}
                    variant="light"
                    isLoading={isUploadLoading}
                    color="secondary"
                    startContent={<Icon>cloud_upload</Icon>}
                >
                    Upload Image from Device
                </Button>
                <input hidden type="file" ref={imageInputRef} onChange={handleImageUpload} />
            </div>
        </div>
        </>
    )
}