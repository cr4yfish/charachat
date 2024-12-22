"use client";

import { Textarea } from "@nextui-org/input";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "./ui/drawer";
import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import { isValidURL, safeParseLink, sleep } from "@/lib/utils";
import { ImageModel, imageModels, VideoModel, videoModels } from "@/lib/ai";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, Tab } from "@nextui-org/tabs";
import { uploadLinkToImgur } from "@/functions/ai/image";
import { Character, Lora } from "@/types/db";

type Props = {
    imageLink: string | null | undefined;
    setImageLink: (link: string) => void;
    saveImage?: () => void;
    trigger: React.ReactNode;
    initImagePrompt?: string;
    setImagePrompt?: (prompt: string) => void;
    initPromptLoading?: boolean;
    character?: Character | undefined;
}

export default function ImagePrompterDrawer(props: Props) {
    const [imageModel, setImageModel] = useState<ImageModel | VideoModel>(imageModels[0]);
    const [imagePrompt, setImagePrompt] = useState("");
    const [isGenerateLoading, setIsGenerateLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState<"prompt" | "model" | "image">("prompt");
    const [currentStatus, setCurrentStatus] = useState<string | undefined>();
    const [loras, setLoras] = useState<Lora[]>([]);
    const { toast } = useToast();

    const abortControllerRef = useRef<AbortController | null>(null);


    const handleSetImageLink = async (imageLink: string) => {

        if(!isValidURL(imageLink) || !imageLink.includes("https://")) {
            toast({
                title: "Error",
                description: "Invalid image link. Make sure it starts with https:// and ends with .jpg/.png or another image extension. Link: " + imageLink,
                variant: "destructive"
            })
            return;
        }

        props.setImageLink(imageLink);
        if(props.setImagePrompt) {
            props.setImagePrompt(imagePrompt)
        }
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

            if(imageModel.provider === "replicate") {

                const res = await fetch("/api/image/replicate", {
                    method: "POST",
                    body: JSON.stringify({
                        imagePrompt: imagePrompt,
                        model: imageModel.id,
                        loras: loras
                    }),
                    signal
                })

                if(res.status !== 201) {
                    throw new Error("Failed to generate image. Error Message: " + await res.text());
                }

                let prediction = await res.json();

                while(
                    prediction.status !== "succeeded" &&
                    prediction.status !== "failed" 
                ) {
                    await sleep(1000);
                    const response = await fetch("/api/image/" + prediction.id)
                    if(response.status !== 200) {
                        throw new Error("Failed to get prediction status. Error Message: " + await response.text());
                    }
                    const res = await response.json();
                    setCurrentStatus(res.status);
                    if(res.status === "succeeded") {
                        prediction = res;
                        let link = "";
                        
                        // output is sometimes array, sometimes string
                        if(Array.isArray(prediction.output)) {
                            link = await uploadLinkToImgur(prediction.output[0]);
                        } else {
                            link = await uploadLinkToImgur(prediction.output);
                        }

                        sleep(500);

                        handleSetImageLink(link);
                        setSelectedTab("image");
                    }
                }
                setIsGenerateLoading(false);
                return;
            }

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
                setSelectedTab("image");
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

    useEffect(() => {
        if(currentStatus) {
            toast({
                title: "Status",
                description: currentStatus
            })
        }
    }, [currentStatus, toast])

    useEffect(() => {
        if(props.character) {
            setLoras(props.character.loras ?? []);
        }
    }, [props.character])

    const toggleLora = (lora: Lora) => {
        if(loras.includes(lora)) {
            setLoras(prev => prev.filter(l => l !== lora));
        } else {
            setLoras(prev => [...prev, lora]);
        }
    }

    return (
        <>
        <Drawer>
            <DrawerTrigger asChild>
                {props.trigger}
            </DrawerTrigger>
            <DrawerContent className=" max-md:h-full w-full" onClick={e => e.stopPropagation()}>
                <DrawerHeader className="flex flex-col items-center justify-center">
                    <DrawerTitle>Image Generator</DrawerTitle>
                </DrawerHeader>

                <div className="max-md:h-full p-4 flex flex-col items-center justify-start flex-wrap gap-3">
                    <Tabs 
                        variant="underlined"
                        color="primary"
                        radius="full"
                        aria-label="Promptflow" 
                        selectedKey={selectedTab} 
                        onSelectionChange={key => setSelectedTab(key as "prompt" | "model" | "image")}
                    >
                        <Tab title={<div className="flex items-center gap-2"><Icon downscale>book</Icon>Prompt</div>} key="prompt" className="w-full flex flex-col gap-2 items-center justify-between">
                            <Textarea 
                                label="Prompt" 
                                description="Describe the image you want to generate. Use keywords for best results. Order matters."
                                className="w-full max-w-xl"
                                autoCorrect="off"
                                autoComplete="off"
                                minRows={8}
                                maxRows={20}
                                value={imagePrompt}
                                onValueChange={setImagePrompt}
                                isDisabled={props.initPromptLoading}
                            />
                        </Tab>
                        <Tab title={<div className="flex items-center gap-2"><Icon downscale>style</Icon>Model</div>} key="model" isDisabled={!imagePrompt || imagePrompt?.length == 0} className="w-full flex flex-col items-center">
                            <div className="flex flex-col w-full justify-center items-center relative gap-2">
                                <p className="text-xs dark:text-zinc-400 w-full max-w-xl">Free Styles using Huggingface (expect queue times and timeouts)</p>
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
                                <p className="text-xs dark:text-zinc-400 w-full max-w-xl">Instant generation using Replicate. <a href={"/settings#api"} className="underline text-blue-500">Get API key</a></p>
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
                                <p className="text-xs dark:text-zinc-400 w-full max-w-xl">GIF using Replicate <a href={"/settings#api"} className="underline text-blue-500">Get API key</a></p>
                                <div className="flex flex-row items-center gap-2 overflow-x-auto max-w-xl w-full justify-self-center self-center relative pb-2">
                                    {videoModels.filter(im => im.provider == "replicate").map((model) => (
                                        <Button
                                            className="min-w-[100px]"
                                            key={model.id}
                                            variant={imageModel.id === model.id ? "solid" : "ghost"}
                                            size="sm"
                                            onClick={() => setImageModel(model)}
                                        >
                                            {model.title}
                                        </Button>
                                    ))}
                                </div>
                                <p className="text-xs dark:text-zinc-400 w-full max-w-xl">Character LoRA. Click to toggle them on/off. Only works on Pony models for now.</p>
                                <div className="flex flex-row items-center gap-2 overflow-x-auto max-w-xl w-full justify-self-center self-center relative pb-2">
                                    {props.character?.loras?.map((lora, index) => (
                                        <Button
                                            className="min-w-[100px]"
                                            key={index}
                                            size="sm"
                                            onClick={() => toggleLora(lora)}
                                            variant={loras.includes(lora) ? "solid" : "ghost"}
                                        >
                                            {lora.title}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Tab>
                        <Tab title={<div className="flex items-center gap-2"><Icon downscale>image</Icon>Result</div>} key="image" isDisabled={!props.imageLink} className="w-full max-md:h-full max-md:max-h-[50%] flex flex-col items-center">
                            <div className="overflow-hidden rounded-xl max-w-[1024px] max-md:h-full">
                                { imageModel.type.includes("-to-image") ?
                                    <img src={safeParseLink(props.imageLink)} className="w-full h-full object-cover" />
                                    :
                                    <video src={safeParseLink(props.imageLink)} className="w-full h-full object-cover" autoPlay controls loop />
                                }
                            </div>
                            {imageModel.type.includes("-to-video") && <p className="text-xs text-red-500 max-w-xs mt-1">If the video doesn&apos;t load: Switch back to prompt and then to image tab again.</p>}
                            <p className="text-xs text-zinc-700 dark:text-zinc-400 w-full text-center mt-1 max-w-xl max-sm:hidden">{imagePrompt}</p>
                        </Tab>
                    </Tabs>


                </div>

                <DrawerFooter className="flex flex-col justify-center items-center w-full max-w-xl self-center">
                    {selectedTab == "prompt" && imagePrompt && imagePrompt.length > 0 &&
                        <Button 
                            onClick={() => setSelectedTab("model")} 
                            radius="full" 
                            fullWidth 
                            size="lg" 
                            color="primary" 
                            endContent={<Icon>arrow_forward</Icon>} 
                            className="mb-2"
                        >
                            Select a model
                        </Button>
                    }
                    {selectedTab == "model" && !isGenerateLoading && <Button 
                        isLoading={props.initPromptLoading}
                        onClick={handleGenerateImage}
                        radius="full"
                        fullWidth
                        size="lg"
                        color="primary"
                        endContent={<Icon filled>send</Icon>}
                    >
                        Generate
                    </Button>}
                    {isGenerateLoading && <Button 
                        isLoading={props.initPromptLoading}
                        onClick={handleAbort}
                        radius="full"
                        fullWidth
                        size="lg"
                        color="danger"
                        endContent={<Icon filled>stop</Icon>}
                    >
                        Abort
                    </Button>}
                    {selectedTab == "image" && !isGenerateLoading && <DrawerClose disabled={!props.imageLink} asChild>
                        <Button 
                            size="lg" 
                            fullWidth 
                            onClick={props.saveImage} 
                            isDisabled={!props.imageLink} 
                            color="primary" 
                            endContent={<Icon>add</Icon>} 
                            radius="full"
                        >
                            Add
                        </Button>
                    </DrawerClose>}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
        </>
    )
}