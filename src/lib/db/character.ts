/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createServerSupabaseClient as createClient } from "./server";
import { Character } from "@/types/db";
import { LoadMoreProps } from "@/types/db";
import { safeParseLink } from "@/lib/utils";

const characterMatcher = `
    *,
    profiles!characters_owner_fkey (*),
    categories!characters_category_fkey (*)
`

const characterTableName = "character_overview"
const publicTableName = "character_overview_public"

const characterFormatter = async (db: any): Promise<Character> => {
    const owner = db.profiles;
    const category = db.categories;
    
    delete db.profiles;
    delete db.categories;

    // let is_liked = false;

    // // quickly check if user is logged in
    // const { data: { user } } = await createClient().auth.getUser();
    // if(user?.id !== undefined) {
    //     // check like status
    //     is_liked = await isCharacterLiked(db.id, user.id);
    // }

    const char = {
        ...db,
        owner: owner,
        category: category,
        is_liked: false,
        tags_full: JSON.stringify(db.tags_full) === "[null]" ? undefined : db.tags_full
    } as Character;

    return char;
}


export const getCharacter = cache(async (characterId: string): Promise<Character> => {
    const { data, error } = await (await createClient())
        .from(characterTableName)
        .select(characterMatcher)
        .eq("id", characterId)
        .single();

    if (error) {
        console.error("Error fetching single character", error);
        throw error;
    }

    return await characterFormatter(data);
})

export const getCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createClient())
        .from(publicTableName)
        .select(characterMatcher)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);
        
    if (error) {
        throw error;
    }

    return await Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

/**
 * Gets the latest 2 characters and returns the first one with a working image link
 */
export const getNewestCharacter = cache(async (): Promise<Character> => {
    const { data, error } = await (await createClient())
        .from(publicTableName)
        .select(characterMatcher)
        .order("created_at", { ascending: false })
        .range(0, 3);

    if (error) {
        throw error;
    }

    return await characterFormatter(data.find((c) => safeParseLink(c.image_link) !== "" && c.is_nsfw == false ));
})

export const getPopularCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createClient())
        .from(publicTableName)
        .select(characterMatcher)
        .order("chats", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);
        
    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

export const getTrendingCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createClient())
        .from("characters_ordered_by_chats")
        .select(characterMatcher)
        .order("recent_chat_count", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);
        
    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})


export const getCharactersByCategory = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    if(!props.args?.categoryId) {    
        throw new Error("Category ID not found");
    }

    const { data, error } = await (await createClient())
        .from(characterTableName)
        .select(characterMatcher)
        .eq("category", props.args.categoryId)
        .eq("is_private", false)
        .eq("is_unlisted", false)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

export const searchCharacters = cache(async (search: string): Promise<Character[]> => {
    const { data, error } = await (await createClient())
        .from(characterTableName)
        .select(characterMatcher)
        .or(`name.ilike.*${search}*` + "," + `description.ilike.*${search}*`);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

export const searchCharactersInfinite = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createClient())
        .from(publicTableName)
        .select(characterMatcher)
        .eq("is_private", false)
        .eq("is_unlisted", false)
        .or(`name.ilike.*${props.args?.search}*` + "," + `description.ilike.*${props.args?.search}*`)
        .order((props.args?.sort as string) || "created_at", { ascending: props.args?.asc == undefined ? false : props.args?.asc as boolean })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

export const getUserCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data: { user }} = await (await createClient()).auth.getUser();

    if(!user?.id) {
        throw new Error("getUserChar: User not found");
    }

    const { data, error } = await (await createClient())
        .from(characterTableName)
        .select(characterMatcher)
        .eq("owner", user.id)
        .order((props.args?.sort as string) ?? "created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

export const getPublicUserCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    if(!props.args?.userId) {
        throw new Error("User ID not found");   
    }

    const { data, error } = await (await createClient())
        .from(publicTableName)
        .select(characterMatcher)
        .eq("owner", props.args.userId)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);
    
    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})


export const deleteCharacter = async (characterId: string): Promise<void> => {
    const { error } = await (await createClient())
        .from("characters")
        .delete()
        .eq("id", characterId);

    if (error) {
        throw error;
    }
}


/**
 * Only works if userId is current userId. Is only a param to make it faster
 * @param characterId 
 * @param userId 
 */
export const isCharacterLiked = cache(async(characterId: string, userId: string): Promise<boolean> => {
    const { data, error } = await (await createClient())
        .from("character_likes")
        .select("character")
        .eq("character", characterId)
        .eq("user", userId);

    if (error) {
        throw error;
    }

    return data.length > 0; 
})

export const likeCharacter = async(characterId: string): Promise<void> => {
    const { data: { user } } = await (await createClient()).auth.getUser();

    if(user?.id === undefined) {
        throw new Error("likeChar: User not found");
    }

    const { error } = await (await createClient())
        .from("character_likes")
        .insert({
            character: characterId,
            user: user.id
        });

    if (error) {
        throw error;
    }
}

export const unlikeCharacter = async(characterId: string): Promise<void> => {
    const { data: { user } } = await (await createClient()).auth.getUser();

    if(user?.id === undefined) {
        throw new Error("unlikeChar: User not found");
    }

    const { error } = await (await createClient())
        .from("character_likes")
        .delete()
        .eq("character", characterId)
        .eq("user", user.id);

    if (error) {
        throw error;
    }
}