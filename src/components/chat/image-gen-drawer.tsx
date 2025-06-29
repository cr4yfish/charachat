"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { memo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import { ImageModel } from "@/lib/ai/models/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isValidURL, safeParseLink } from "@/lib/utils/text";
import { imageModels } from "@/lib/ai/models/image";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type Step = "prompt" | "model" | "result";

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    context?: {
        messageId?: string;
        chatId?: string;
    },
    callback: (imageLink: string, imagePrompt: string) => void;
}

const PureImageGenDrawer = (props: Props) => {
    const [step, setStep] = useState<Step>("prompt");
    const [imageModel, setImageModel] = useState<ImageModel | undefined>();
    const [isGenerateLoading, setIsGenerateLoading] = useState<boolean>(false);
    const [imagePrompt, setImagePrompt] = useState<string>("");
    const [internalImageLink, setInternalImageLink] = useState<string>("");
    
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleSetImageLink = async () => {

        if(!isValidURL(internalImageLink) || !internalImageLink.includes("https://")) {
            return;
        }
        props.callback(internalImageLink, imagePrompt);
        props.onOpenChange(false);
    }

    const handleGenerateImage = async () =>  {
        if(!imagePrompt || !imageModel) {
            console.error("Image prompt or model is not set.", { imagePrompt, imageModel });
            toast.error("Please enter a prompt and select a model." );
            return;
        }

        setIsGenerateLoading(true);
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        try {

            const res = await fetch("/api/image/replicate", {
                method: "POST",
                body: JSON.stringify({
                    imagePrompt: imagePrompt,
                    model: imageModel.id,
                }),
                signal
            })

            if(res.status !== 201) {
                throw new Error("Failed to generate image. Error Message: " + await res.text());
            }

            const { imageUrl } = await res.json();

            setInternalImageLink(imageUrl);
            setStep("result");
            toast.success("Image generated successfully!");

            setIsGenerateLoading(false);
            
        } catch(e) {
            const err = e as Error;
            console.error("Error generating image:", err);
        }

        setIsGenerateLoading(false);
    }

    const handleAbort = () => {
        if(abortControllerRef.current) {
            abortControllerRef.current.abort("Aborted by user");
            setIsGenerateLoading(false);
        }
    }

    return (
        <Drawer open={props.isOpen} onOpenChange={props.onOpenChange}>
            <DrawerContent className="max-h-screen min-h-screen ios-safe-header-padding-drawer">
                <DrawerHeader>
                    <DrawerTitle>Image Generator</DrawerTitle>
                    <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col px-4">
                    <Tabs defaultValue="prompt" value={step} onValueChange={(val) => setStep(val as Step)} className="w-full">
                        <TabsList>
                            <TabsTrigger value="prompt">Prompt</TabsTrigger>
                            <TabsTrigger value="model">Model</TabsTrigger>
                            <TabsTrigger value="result">Result</TabsTrigger>
                        </TabsList>
                        <TabsContent value="prompt">
                            <TextareaWithCounter 
                                maxLength={1000} 
                                rows={12}
                                className="min-h-[300px] h-full"
                                placeholder="Image prompt" 
                                onChange={setImagePrompt}
                                description="Describe the image you want to generate. Use keyword for best results. Order matters." 
                            />
                        </TabsContent>
                        <TabsContent value="model">
                            <ScrollArea className="w-full h-[160px]">
                                <div  className="flex flex-row gap-2 w-max">
                                    {imageModels.map((model) => (
                                        <div
                                            key={model.id}
                                            className={cn("relative border border-border flex flex-col items-center gap-2 rounded-xl shrink-0 w-[90px] h-[150px] px-2 py-1 cursor-pointer transition-all overflow-hidden")}
                                            onClick={() => setImageModel(model)}
                                        >
                                            {/* Image */}
                                            {model.image && (
                                                <AspectRatio ratio={3/4} className="w-[75px] overflow-hidden rounded-md" >
                                                    <Image 
                                                        src={safeParseLink(model.image)} 
                                                        alt={model.name} fill
                                                        className={cn("pointer-events-none object-center object-cover")}
                                                    />
                                                </AspectRatio>
                                            )}
                                            
                                            {/* Bg blur */}
                                            <div className={cn("absolute top-0 left-0 size-full -z-10 blur-xl pointer-events-none opacity-10 transition-all", { "opacity-100": imageModel?.id === model.id })}>
                                                <Image 
                                                    src={safeParseLink(model.image || "https://via.placeholder.com/32")} 
                                                    alt={model.name} fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            <span className="text-xs">{model.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>

                        </TabsContent>
                        <TabsContent value="result">
                            <div className="flex flex-col gap-2">
                                <div className="h-[300px] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                                    {!internalImageLink && <span className="text-gray-500">Generated image will appear here</span>}
                                    {internalImageLink && (
                                        <Image 
                                            src={safeParseLink(internalImageLink)} 
                                            alt="Generated Image" 
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>


                </div>
                <DrawerFooter>
                    {isGenerateLoading && (
                        <Button variant="outline" onClick={handleAbort}>
                            Abort Generation
                            <span className="ml-2 loading loading-spinner loading-sm"></span>
                        </Button>
                    )}
                    {step === "prompt" && <Button variant={"liquid"} onClick={() => setStep("model")} >Select a model</Button>}
                    {step === "model" && <Button onClick={handleGenerateImage}>Generate Image</Button>}
                    {step === "result" && <Button disabled={isGenerateLoading} onClick={handleSetImageLink}>
                        Add Image Link
                        {isGenerateLoading && <span className="ml-2 loading loading-spinner loading-sm"></span>}
                    </Button>}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export const ImageGenDrawer = memo(PureImageGenDrawer, (prev, next) => {
    return prev.isOpen === next.isOpen;
});