"use client";

import { Button } from "../ui/button";
import { AlertTriangleIcon, EyeOffIcon, HeartIcon, LockIcon, MessageCircleIcon, ShieldIcon } from "lucide-react";
import { Character } from "@/lib/db/types/character";
import { useState } from "react";
import { toggleCharacterLikeAction } from "@/app/c/[id]/actions";
import { Badge } from "../ui/badge";

export default function CharacterPageActions({ character }: { character: Character }) {
    const [isLiked, setIsLiked] = useState(character.is_liked || false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        toggleCharacterLikeAction(character.id, isLiked).then((res) => {
            console.log("Character like status toggled:", res);
        }).catch((error) => {
            console.error("Error toggling character like status:", error);
        });
    }

    return (
        <div className="flex flex-row flex-wrap gap-2 text-sm dark:text-zinc-200">
            
            <Button variant={"ghost"} className="flex items-center gap-2">
                <MessageCircleIcon />
                <span>{character.chats} Chats</span>
            </Button>

            <Button onClick={handleLike} variant={"ghost"} className="flex items-center gap-2">
                {<HeartIcon fill="red" fillOpacity={isLiked ? 1 : 0}  color="red" />}
                {(character.likes && character.likes > 0) ? <span>{character.likes} Likes</span> : <span>{isLiked ? "Liked" : "Like"}</span>}
            </Button>
        

            {character.is_private && 
                <Button variant={"outline"} className="flex items-center gap-2 text-emerald-500">
                    <LockIcon color="currentColor" />
                    <span>Private</span>
                </Button>
            }

            {character.is_unlisted && 
                <Button variant={"outline"} className="flex items-center gap-2 text-sky-400">
                    <EyeOffIcon color="currentColor" />
                    <span>Unlisted</span>
                </Button>
            }

            {character.hide_definition && 
                <Button variant={"outline"} className="flex items-center gap-2 text-orange-400">
                    <ShieldIcon color="currentColor" />
                    <span>Theft Protected</span>
                </Button>
            }

            {character.is_nsfw && 
                <Button variant={"outline"} className="flex items-center gap-2 text-red-400">
                    <AlertTriangleIcon color="currentColor" />
                    <span>NSFW</span>
                </Button>
            }

            <div className="flex flex-row items-center flex-wrap gap-2">
                {character.category && 
                <Badge variant={"ghost"}>
                    {character.category.title}
                </Badge>
                }
                {character.tags_full?.map((tag, index) => (
                    <Badge key={`tag-${index}`} variant={"ghost"}>
                        {tag.name}
                    </Badge>
                ))}
            </div>
        </div>
    )   
}