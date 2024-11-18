"use server";

import { v4 as uuidV4 } from "uuid";

import { createClient } from "@/utils/supabase/supabase";
import { Character } from "@/types/db";

export const saveCharacter = async (char: Character): Promise<{ data: Character, error: string }> => {

    const { data: { user } } = await createClient().auth.getUser();

    if(!user) {
        throw new Error("Only authenticated users can create characters");
    }

    const newChar = {
        ...char,
        id: uuidV4(),
        owner: user.id
    }

    const { data, error } = await createClient()
        .from("characters")
        .insert(newChar)
        .eq("id", newChar.id)
        .select("*").single();

    return {
        data, 
        error: error?.message || ""
    }

}
