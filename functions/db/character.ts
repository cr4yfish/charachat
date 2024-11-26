/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Character } from "@/types/db";
import { checkIsEncrypted, decryptMessage, encryptMessage } from "@/lib/crypto";
import { getKeyServerSide } from "../serverHelpers";
import { LoadMoreProps } from "@/types/client";

const characterMatcher = `
    *,
    profiles!characters_owner_fkey (*),
    categories!characters_category_fkey (*)
`

const characterTableName = "character_overview"

const characterFormatter = async (db: any): Promise<Character> => {
    const owner = db.profiles;
    const category = db.categories;
    
    delete db.profiles;
    delete db.categories;

    let is_liked = false;

    // quickly check if user is logged in
    const { data } = await createClient().auth.getSession();
    if(data.session?.user.id !== undefined) {
        // check like status
        is_liked = await isCharacterLiked(db.id, data.session.user.id);
    }

    const char = {
        ...db,
        owner: owner,
        category: category,
        is_liked: is_liked
    } as Character;

    if(char.is_private) {

        if(char.is_private && !checkIsEncrypted(char.name)) {
            // character is private but not encrypted
            // encrypt it and update, return the unencrypted version
            // updateCharacter() automatically fixes this issue
            await updateCharacter(char);
            return char;
        }

        try {
            const key = await getKeyServerSide();
            return await decryptCharacter(char, key);
        } catch (error) {
            console.error("Error decrypting character", error);
            return char;
        }
      
    }

    return char;
}

export const decryptCharacter = async (character: Character, key: string): Promise<Character> => {
    const buffer = Buffer.from(key, "hex");

    try {
        return {
            ...character,
            name: decryptMessage(character.name, buffer),
            description: decryptMessage(character.description, buffer),
            intro: decryptMessage(character.intro, buffer),
            bio: decryptMessage(character.bio, buffer),
            book: decryptMessage(character.book, buffer),
            image_link: decryptMessage(character.image_link ?? "", buffer),
            personality: decryptMessage(character.personality, buffer),
            system_prompt: decryptMessage(character.system_prompt ?? "", buffer),
            image_prompt: decryptMessage(character.image_prompt ?? "", buffer),
            first_message: decryptMessage(character.first_message ?? "", buffer),
        }
    } catch (error) {
        console.error("Error decrypting character", error);
        return character;
    }

}

export const encryptCharacter = async (character: Character, key: string): Promise<Character> => {
    const buffer = Buffer.from(key, "hex");

    return {
        ...character,
        name: encryptMessage(character.name, buffer),
        description: encryptMessage(character.description, buffer),
        intro: encryptMessage(character.intro, buffer),
        bio: encryptMessage(character.bio, buffer),
        book: encryptMessage(character.book, buffer),
        image_link: encryptMessage(character.image_link ?? "", buffer),
        personality: encryptMessage(character.personality, buffer),
        system_prompt: encryptMessage(character.system_prompt ?? "", buffer),
        image_prompt: encryptMessage(character.image_prompt ?? "", buffer),
        first_message: encryptMessage(character.first_message ?? "", buffer),
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

    return await characterFormatter(data);
})

export const getCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from(characterTableName)
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

export const getPopularCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await createClient()
        .from(characterTableName)
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


export const getCharactersByCategory = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    if(!props.args?.categoryId) {    
        throw new Error("Category ID not found");
    }

    console.log("Category ID", props.args.categoryId);
    
    const { data, error } = await createClient()
        .from(characterTableName)
        .select(characterMatcher)
        .eq("category", props.args.categoryId)
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
    const { data, error } = await createClient()
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

    return Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

export const updateCharacter = async (character: Character): Promise<void> => {

    if(character.is_private && !checkIsEncrypted(character.name)) {
        const key = await getKeyServerSide();
        character = await encryptCharacter(character, key);
    }

    delete character.chats;
    delete character.likes;
    delete character.is_liked;

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


/**
 * Only works if userId is current userId. Is only a param to make it faster
 * @param characterId 
 * @param userId 
 */
export const isCharacterLiked = cache(async(characterId: string, userId: string): Promise<boolean> => {
    const { data, error } = await createClient()
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
    const { data } = await createClient().auth.getSession();

    if(data.session?.user.id === undefined) {
        throw new Error("User not found");
    }

    const { error } = await createClient()
        .from("character_likes")
        .insert({
            character: characterId,
            user: data.session.user.id
        });

    if (error) {
        throw error;
    }
}

export const unlikeCharacter = async(characterId: string): Promise<void> => {
    const { data } = await createClient().auth.getSession();

    if(data.session?.user.id === undefined) {
        throw new Error("User not found");
    }

    const { error } = await createClient()
        .from("character_likes")
        .delete()
        .eq("character", characterId)
        .eq("user", data.session.user.id);

    if (error) {
        throw error;
    }
}