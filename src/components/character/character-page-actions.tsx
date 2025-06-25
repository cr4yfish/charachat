"use client";

import { Button } from "../ui/button";
import { BookmarkIcon, HeartIcon, MessageCircleIcon } from "lucide-react";
import { bookmarkCharacterAction } from "@/app/c/[id]/actions";
import { Character } from "@/lib/db/types/character";

export default function CharacterPageActions({ character }: { character: Character }) {


   const handleBookmark = async () => {
        await bookmarkCharacterAction(character.id);
    }

    return (
        <div className="flex flex-row flex-wrap gap-2 text-sm dark:text-zinc-200">
            
            <div className="flex items-center gap-2">
                <MessageCircleIcon />
                <span>{character.chats} Chats</span>
            </div>

            <div className="flex items-center gap-2">
                <HeartIcon />
                <span>{character.likes} Likes</span>
            </div>
            
            <Button variant={"outline"} className="relative" onClick={handleBookmark}>
                <div className="mr-4 flex items-center gap-1 w-full">
                    <span><BookmarkIcon /></span>
                    <span>Save</span>
                </div>
                
                <div className="absolute right-0 top-0 h-full rounded-md flex items-center justify-center pr-3 pl-1">
                    <span>0</span>
                </div>
            </Button>
        </div>
    )   
}