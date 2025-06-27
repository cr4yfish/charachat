"use server";

import { createServerSupabaseClient as createClient } from "./server";
import { currentUser } from "@clerk/nextjs/server";

type Props = {
    /**
     * Whether to like or unlike the character.
     */
    like: boolean;
    charId: string;
}

export async function likeCharacter({ like, charId }: Props): Promise<void> {
    
    const user = await currentUser();

    if (!user) {
        throw new Error("User not authenticated");
    }
    
    try {

        if(like) {  await handleLike({ charId, userId: user.id }); }
        else { await unlikeCharacter({ charId, userId: user.id }); }

    } catch (error) {
        console.error("Error liking character:", error);
        throw error;
    }
    
}

async function handleLike({ charId, userId }: { charId: string; userId: string }): Promise<void> {
    const { error } = await (await createClient())
        .from("character_likes")
        .insert({
            character: charId,
            clerk_user_id: userId
        });

    if (error) {
        throw error;
    }
}

export async function unlikeCharacter({ charId, userId }: { charId: string; userId: string }): Promise<void> {
    const { error } = await (await createClient())
        .from("character_likes")
        .delete()
        .eq("character", charId)
        .eq("clerk_user_id", userId);

    if (error) {
        throw error;
    }
}