"use client";

import { v4 as uuidv4 } from "uuid";

import { useState } from "react";

import { Profile, Story } from "@/types/db";

import { useToast } from "@/hooks/use-toast";
import { Button } from "../utils/Button";
import { createChat } from "@/functions/db/chat";

type Props = {
    story: Story;
    profile?: Profile
}

export default function StartStoryButton(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleStartStory = async () => {
        if(!props.profile) {
            toast({
                title: "Error",
                description: "You must be logged in to start a story",
                variant: "destructive",
            })
            return;
        };

        setIsLoading(true);
        // Start story
        try {

            const chatId =   uuidv4();
            const res = await createChat({
                chatId: chatId,
                userId: props.profile.user,
                characterId: props.story.character.id,
                title: "New Chat",
                description: "New Chat",
                storyId: props.story.id
            });

            if(res.id) {
                window.location.href = `/chat/${res.id}`;
            }

        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    return (
        <>
        <Button 
            fullWidth size="lg" 
            color="primary" 
            variant="shadow"
            isLoading={isLoading}
            onClick={handleStartStory}
        >
            Start Story
        </Button>
        </>
    )
}