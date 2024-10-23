/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Character } from "@/types/db";

export const getCharacter = cache(async (characterId: string): Promise<Character> => {
    const { data, error } = await createClient().from("characters").select("*").eq("id", characterId).single();

    if (error) {
        throw error;
    }

    return data;
})

export const getCharacters = cache(async (): Promise<Character[]> => {
    const { data, error } = await createClient().from("characters").select(`
        *,
        profiles!characters_owner_fkey1 (*)    
    `);
    
    if (error) {
        throw error;
    }

    console.log(data);

    return data.map((db: any) => {
        return {
            ...db
        }
    });
})