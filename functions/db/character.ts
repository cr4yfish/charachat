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

const characterTableName = "character_overview"

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
        .from(characterTableName)
        .select(characterMatcher)
        .eq("id", characterId)
        .single();

    if (error) {
        console.error("Error fetching single character", error);
        throw error;
    }

    return characterFormatter(data);
})

export const getCharacters = cache(async (cursor: number, limit: number): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from(characterTableName)
        .select(characterMatcher)
        .order("created_at", { ascending: false })
        .range(cursor, cursor + limit - 1);
        
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(db);
    });
})

export const getPopularCharacters = cache(async (cursor: number, limit: number): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from(characterTableName)
        .select(characterMatcher)
        .order("chats", { ascending: false })
        .range(cursor, cursor + limit - 1);
        
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(db);
    });
})

export const getCharactersByCategory = cache(async (categoryId: string, cursor: number, limit: number): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from(characterTableName)
        .select(characterMatcher)
        .eq("category", categoryId)
        .order("created_at", { ascending: false })
        .range(cursor, cursor + limit - 1);

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(db);
    });
})

export const searchCharacters = cache(async (search: string): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from(characterTableName)
        .select(characterMatcher)
        .or(`name.ilike.*${search}*` + "," + `description.ilike.*${search}*`);

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(db);
    });
})

export const getUserCharacters = cache(async (cursor: number, limit: number): Promise<Character[]> => {
    const { data: { user }} = await createClient().auth.getUser();

    if(!user?.id) {
        throw new Error("User not found");
    }

    const { data, error } = await createClient()
        .from(characterTableName)
        .select(characterMatcher)
        .eq("owner", user.id)
        .order("created_at", { ascending: false })
        .range(cursor, cursor + limit - 1);

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return characterFormatter(db);
    });
})

export const updateCharacter = async (character: Character): Promise<void> => {
    const { error } = await createClient()
        .from(characterTableName)
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
        .from(characterTableName)
        .delete()
        .eq("id", characterId);

    if (error) {
        throw error;
    }
}