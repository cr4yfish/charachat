"use server";

import { v4 as uuidV4 } from "uuid";

import { createClient } from "@/utils/supabase/supabase";
import { Character } from "@/types/db";

export const saveCharacter = async (char: Character): Promise<{ data: Character, error: string }> => {
    const client = await createClient();

    const { data: { user } } = await client.auth.getUser();

    if(!user) {
        throw new Error("Only authenticated users can create characters");
    }

    const newChar = {
        ...char,
        id: uuidV4(),
        owner: user.id,
        tags: char.tags_full?.map(t => t.id)
    }

    delete newChar.tags_full;

    
    const { data, error } = await client
        .from("characters")
        .insert(newChar)
        .eq("id", newChar.id)
        .select("*").single();

    return {
        data, 
        error: error?.message || ""
    }

}
