"use client";

import { Textarea } from "@nextui-org/input";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "./ui/drawer";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import { isValidURL, safeParseLink } from "@/lib/utils";
import { ImageModel, imageModels } from "@/lib/ai";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Props = {
    imageLink: string | null;
    setImageLink: (link: string | null) => void;
    saveImage?: () => void;
    trigger: React.ReactNode;
    initImagePrompt?: string;
    initPromptLoading?: boolean;
}

export default function ImagePrompterDrawer(props: Props) {
    const [imageModel, setImageModel] = useState<ImageModel>(imageModels[0]);
    const [imagePrompt, setImagePrompt] = useState("");
    const [isGenerateLoading, setIsGenerateLoading] = useState(false);
    const { toast } = useToast();

    const abortControllerRef = useRef<AbortController | null>(null);


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

    const handleAbort = () => {
        console.log("aborting");
        if(abortControllerRef.current) {
            abortControllerRef.current.abort("Aborted by user");
            setIsGenerateLoading(false);
        }
    }

    useEffect(() => {
        if(props.initImagePrompt) {
            setImagePrompt(props.initImagePrompt);
        }
    }, [props.initImagePrompt])

    return (
        <>
        <Drawer>
            <DrawerTrigger asChild>
                {props.trigger}
            </DrawerTrigger>
            <DrawerContent className="!h-fit">
                <DrawerHeader className="flex flex-col items-center justify-center">
                    <DrawerTitle>Image Generator</DrawerTitle>
                    <DrawerDescription>The generated image is used automatically</DrawerDescription>
                </DrawerHeader>

                <div className="p-4 flex flex-col items-center justify-center flex-wrap gap-3 h-fit">
                    <div className="overflow-hidden rounded-xl">
                        <img 
                            src={safeParseLink(props.imageLink ?? "")} 
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
                        isDisabled={props.initPromptLoading}
                        endContent={
                            <Button 
                                isLoading={props.initPromptLoading}
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

                <DrawerFooter className="pb-12 flex items-center">
                    <DrawerClose disabled={!props.imageLink} asChild className="max-w-xl">
                        <Button onClick={props.saveImage} isDisabled={!props.imageLink} color="primary" size="lg" fullWidth>Add to Chat</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        </>
    )
}