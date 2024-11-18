/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Character } from "@/types/db";

const characterMatcher = `
    *,
    profiles!characters_owner_fkey (*),
    categories!characters_category_fkey (*)
`

const characterFormatter = (db: any): Character => {
    const owner = db.profiles;
    const category = db.categories;
    
    delete db.profiles;
    delete db.categories;

    return {
        ...db,
        owner: owner,
        category: category
    }
}

export const getCharacter = cache(async (characterId: string): Promise<Character> => {
    const { data, error } = await createClient()
        .from("characters")
        .select(characterMatcher)
        .eq("id", characterId)
        .single();

    if (error) {
        console.error("Error fetching single character", error);
        throw error;
    }

    return characterFormatter(data);
})

export const getCharacters = cache(async (): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from("characters")
        .select(characterMatcher)
        
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(db);
    });
})

export const searchCharacters = cache(async (search: string): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from("characters")
        .select(characterMatcher)
        .or(`name.ilike.*${search}*` + "," + `description.ilike.*${search}*`);

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(data);
    });
})

export const getUserCharacters = cache(async (userId: string): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from("characters")
        .select(characterMatcher)
        .eq("owner", userId);

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(data);
    });
})

export const updateCharacter = async (character: Character): Promise<void> => {
    const { error } = await createClient()
        .from("characters")
        .update({
            ...character,
            owner: character.owner.user,
            category: character.category?.id
        })
        .eq("id", character.id);

    if (error) {
        throw error;
    }
}

export const deleteCharacter = async (characterId: string): Promise<void> => {
    const { error } = await createClient()
        .from("characters")
        .delete()
        .eq("id", characterId);

    if (error) {
        throw error;
    }
}