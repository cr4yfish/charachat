"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Button } from "../utils/Button";
import Link from "next/link";
import Icon from "../utils/Icon";
import { likeCharacter, unlikeCharacter } from "@/functions/db/character";
import { createChat } from "@/functions/db/chat";
import { useToast } from "@/hooks/use-toast";
import { Character, Profile } from "@/types/db";
import { getCurrentUser } from "@/functions/db/auth";


type Props = {
    character: Character;
}

export default function CharacterPageActions(props: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(props.character.is_liked ?? false);
    const [profile, setProfile] = useState<Profile | undefined>(undefined);
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const tmp = await getCurrentUser();
            setProfile(tmp);
            setIsLoadingProfile(false)
        }
        if(!profile && !isLoadingProfile) {
            setIsLoadingProfile(true);
            fetchProfile();
        }
    }, [profile, isLoadingProfile])

    const handleStartChat = async () => {
        if(!profile) {
            console.error("No profile found");
            toast({
                title: "Error",
                description: "You need to be logged in to start a chat",
                variant: "destructive"
            })
            return;
        }
        setIsLoading(true);

        const characterId = props.character.id;
    
        const chat = await createChat({
            chatId: uuidv4(),
            userId: profile.user,
            characterId: characterId,
            title: "New Chat",
            description: "This is a new chat"
        });
    
        if(!chat) {
            throw new Error("Failed to create chat");
        }

        router.replace(`/chat/${chat.id}`);
    }

    const handleLike = async () => {
        setIsLiking(true);

        try {
            if(isLiked) {
                await unlikeCharacter(props.character.id);
            } else {
                await likeCharacter(props.character.id);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Failed to like character", error);
            toast({
                title: "Error",
                description: "Failed to like character",
                variant: "destructive"
            })
        } finally {
            setIsLiking(false);
        }
    }
    return (
        <>
        <Button 
            onClick={handleStartChat} 
            size="lg" color="primary" 
            isLoading={isLoading}
            radius="full"
        >
            Start Chat
        </Button>
        {profile?.user == props.character.owner.user ?
            <Link href={`/c/${props.character.id}/edit`}>
                <Button
                    color="warning" isDisabled={isLoading}
                    size="lg" variant="flat" radius="full"                        
                >
                    Edit
                </Button>
            </Link>
            :
            <Button 
                color="danger" variant="flat" 
                radius="full" size="lg" 
                onClick={handleLike}
                isLoading={isLiking}
                isIconOnly
            >
                <Icon filled={isLiked} >
                    {isLiked ? "favorite" : "heart_plus"}
                </Icon>
            </Button>
        }
        </>
    )
}