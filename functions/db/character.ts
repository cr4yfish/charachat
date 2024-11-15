/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Character } from "@/types/db";

export const getCharacter = cache(async (characterId: string): Promise<Character> => {
    const { data, error } = await createClient()
        .from("characters")
        .select(`
            *,
            profiles!characters_owner_fkey (*)
        `)
        .eq("id", characterId)
        .single();

    if (error) {
        throw error;
    }

    const owner = data.profiles;

    delete data.profiles;

    return {
        ...data,
        owner: owner
    }
})

export const getCharacters = cache(async (): Promise<Character[]> => {
    const { data, error } = await createClient().from("characters").select(`
        *,
        profiles!characters_owner_fkey (*) 
    `);
    
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return {
            ...db,
            owner: db.profiles
        }
    });
})

export const updateCharacter = async (character: Character): Promise<void> => {
    const { error } = await createClient()
        .from("characters")
        .update({
            ...character,
            owner: character.owner.user
        })
        .eq("id", character.id);

    if (error) {
        throw error;
    }
}