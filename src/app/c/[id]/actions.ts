"use server";

import { bookmarkCharacter } from "@/lib/db/character";
import { likeCharacter } from "@/lib/db/like";


export async function bookmarkCharacterAction(charId: string): Promise<void> {
    try {
        await bookmarkCharacter(charId);

    } catch (error) {
        console.error("Error bookmarking character:", error);
        throw error;
    }
}

export async function toggleCharacterLikeAction(charId: string, isLiked: boolean): Promise<void> {
    try {

        await likeCharacter({
            like: !isLiked, // toggle like status
            charId: charId
        })

    } catch (error) {
        console.error("Error toggling character like:", error);
        throw error;
    }
}