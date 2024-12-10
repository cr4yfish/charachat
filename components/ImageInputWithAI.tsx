"use client";

import { Input, Textarea } from "@nextui-org/input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./utils/Button";
import { useRef, useState } from "react";
import Icon from "./utils/Icon";
import { isValidURL, safeParseLink } from "@/lib/utils";
import { Avatar } from "@nextui-org/avatar";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "./ui/drawer";
import { ImageModel, imageModels } from "@/lib/ai";


type Props = {
    contextFields: string[];
    imageLink: string | undefined;
    setImageLink: (link: string) => void;
    disableAI?: boolean;
}

export default function ImageInputWithAI(props: Props) {
    const [isGenerateLoading, setIsGenerateLoading] = useState(false);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageModel, setImageModel] = useState<ImageModel>(imageModels[0]);
    const { toast } = useToast();

    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleGenerateImage = async () =>  {
        if(!imagePrompt) {
            toast({
                title: "Error",
                description: "Prompt is required to generate an image",
                variant: "destructive"
            })
            return;
        }

        setIsGenerateLoading(true);
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        try {

            toast({
                title: "Generating an image",
                description: `Using ${imageModel.title} model running on ${imageModel.provider}...`,
            })

            const res = await fetch("/api/image", {
                method: "POST",
                body: JSON.stringify({
                    contextFields: props.contextFields,
                    imagePrompt: imagePrompt,
                    model: imageModel.id,
                    provider: imageModel.provider
                }),
                signal
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

    const handleAbort = () => {
        console.log("aborting");
        if(abortControllerRef.current) {
            abortControllerRef.current.abort("Aborted by user");
            setIsGenerateLoading(false);
        }
    }
    
    return (
        <>
        <div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Avatar className="min-w-[50px] h-[50px]" src={safeParseLink(props.imageLink)} alt="avatar" />
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
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button 
                                variant="light" color="primary" 
                                startContent={<Icon>auto_awesome</Icon>}
                            >
                                Generate Image
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent className="!h-fit">
                            <DrawerHeader className="flex flex-col items-center justify-center">
                                <DrawerTitle>Image Generator</DrawerTitle>
                                <DrawerDescription>The generated image is used automatically</DrawerDescription>
                            </DrawerHeader>
            
                            <div className="p-4 flex flex-col items-center justify-center flex-wrap gap-3 h-fit">
                                <div className="overflow-hidden rounded-xl">
                                    <img 
                                        src={safeParseLink(props.imageLink)} 
                                        alt="" 
                                        width={512} 
                                        height={512} 
                                    />
                                </div>

                                <div className="flex flex-col w-full justify-center items-center relative gap-2">
                                    <p className="text-xs dark:text-zinc-400 w-full max-w-xl">Free Styles using Huggingface (expect queue times)</p>
                                    <div className="flex flex-row items-center gap-2 overflow-x-auto max-w-xl w-full justify-self-center self-center relative pb-2">
                                        {imageModels.filter(im => im.provider !== "replicate").map((model) => (
                                            <Button
                                                className="min-w-[100px]"
                                                key={model.id}
                                                variant={imageModel.id === model.id ? "solid" : "ghost"}
                                                size="sm"
                                                onClick={() => setImageModel(model)}
                                            >
                                                {model.style}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs dark:text-zinc-400 w-full max-w-xl">Instant generation using Replicate</p>
                                    <div className="flex flex-row items-center gap-2 overflow-x-auto max-w-xl w-full justify-self-center self-center relative pb-2">
                                        {imageModels.filter(im => im.provider == "replicate").map((model) => (
                                            <Button
                                                className="min-w-[100px]"
                                                key={model.id}
                                                variant={imageModel.id === model.id ? "solid" : "ghost"}
                                                size="sm"
                                                onClick={() => setImageModel(model)}
                                            >
                                                {model.style}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <Textarea 
                                    label="Prompt" 
                                    description="Describe the image you want to generate. Use keywords for best results. Order matters."
                                    className="w-full max-w-xl"
                                    autoCorrect="off"
                                    autoComplete="off"
                                    value={imagePrompt}
                                    onValueChange={setImagePrompt}
                                    endContent={
                                        <Button 
                                            isIconOnly 
                                            onClick={() => {
                                                if(isGenerateLoading) {
                                                    console.log("aborting");
                                                    handleAbort();
                                                } else {
                                                    handleGenerateImage();
                                                }
                                            }}
                                            radius="full"
                                            color="primary"
                                        >
                                            <Icon filled>{isGenerateLoading ? "stop" : "send"}</Icon>
                                        </Button>
                                    } 
                                />
                            </div>
            
                            <DrawerFooter>
                                <DrawerClose>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
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