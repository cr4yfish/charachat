"use client";

import { Input } from "@nextui-org/input";
import { useToast } from "@/hooks/use-toast";
import { Character, Persona, Story } from "@/types/db";
import { Button } from "./utils/Button";
import { useState } from "react";
import Icon from "./utils/Icon";


type Props = {
    character?: Character | undefined;
    story?: Story | undefined;
    persona?: Persona | undefined;
    setImageLink: (link: string) => void
}

export default function ImageInputWithAI(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateImage = async () =>  {
        setIsLoading(true);

        try {
            const res = await fetch("/api/image", {
                method: "POST",
                body: JSON.stringify({
                    character: props.character,
                    story: props.story,
                    persona: props.persona
                })
            })
    
            if(res.status === 200) {
                const { link } = await res.json();
                if(!link) {
                    throw new Error("Got no image link from the server");
                }
                handleSetImageLink(link);
            } else {
                throw new Error("Failed to generate image");
            }
        } catch(e) {
            const err = e as Error;
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }

        setIsLoading(false);
    }

    const handleSetImageLink = async (imageLink: string) => {
        props.setImageLink(imageLink);
    }
    
    return (
        <>
        <div>
            <Input 
                name="image_link"
                label="Image Link" 
                placeholder="https://i.imgur.com/XgbZdeAb.jpg" 
                description="Direct link to an image. Link needs to end with image extension (e.g. .jpg)!" 
                value={props.story?.image_link ?? props.character?.image_link ?? props.persona?.avatar_link ?? ""}
                onValueChange={handleSetImageLink}
            />
            <Button 
                isLoading={isLoading} 
                onClick={handleGenerateImage} 
                variant="light" color="primary" 
                startContent={<Icon>auto_awesome</Icon>}
            >
                Generate Image
            </Button>
        </div>
        </>
    )
}