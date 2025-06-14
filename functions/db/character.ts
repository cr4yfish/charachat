"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Character, Lora } from "@/types/db";
import { checkIsEncrypted, decryptMessage, encryptMessage } from "@/lib/crypto";
import { getKeyServerSide } from "../serverHelpers";
import { LoadMoreProps } from "@/types/client";
import { safeParseLink } from "@/lib/utils";
import { decryptTag, encryptTag } from "./tags";

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

    let is_liked = false;

    // quickly check if user is logged in
    const { data: { user } } = await (await createClient()).auth.getUser();
    if(user?.id !== undefined) {
        // check like status
        is_liked = await isCharacterLiked(db.id, user.id);
    }

    const char = {
        ...db,
        owner: owner,
        category: category,
        is_liked: is_liked,
        tags_full: JSON.stringify(db.tags_full) === "[null]" ? undefined : db.tags_full
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
            name: decryptMessage(character.name ?? " ", buffer),
            description: decryptMessage(character.description ?? " ", buffer),
            intro: decryptMessage(character.intro ?? "", buffer),
            bio: decryptMessage(character.bio ?? " ", buffer),
            book: decryptMessage(character.book ?? " ", buffer),
            image_link: decryptMessage(character.image_link ?? " ", buffer),
            personality: decryptMessage(character.personality ?? " ", buffer),
            system_prompt: decryptMessage(character.system_prompt ?? " ", buffer),
            image_prompt: decryptMessage(character.image_prompt ?? " ", buffer),
            first_message: decryptMessage(character.first_message ?? " ", buffer),
            speaker_link: decryptMessage(character.speaker_link ?? " ", buffer),
            scenario: decryptMessage(character.scenario ?? " ", buffer),
            tags_full: (character.tags_full) ? await Promise.all(character.tags_full.map(t => decryptTag(t))) : [],
            loras: character.loras ? await Promise.all(character.loras.map(l => decryptLora(l, buffer))) : []
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
        name: encryptMessage(character.name ?? " ", buffer),
        description: encryptMessage(character.description ?? " ", buffer),
        intro: encryptMessage(character.intro ?? "", buffer),
        bio: encryptMessage(character.bio ?? " ", buffer),
        book: encryptMessage(character.book ?? " ", buffer),
        image_link: encryptMessage(character.image_link ?? " ", buffer),
        personality: encryptMessage(character.personality ?? " ", buffer),
        system_prompt: encryptMessage(character.system_prompt ?? " ", buffer),
        image_prompt: encryptMessage(character.image_prompt ?? " ", buffer),
        first_message: encryptMessage(character.first_message ?? " ", buffer),
        speaker_link: encryptMessage(character.speaker_link ?? " ", buffer),
        scenario: encryptMessage(character.scenario ?? " ", buffer),
        tags_full: character.tags_full ? await Promise.all(character.tags_full.map(t => encryptTag(t))) : [],
        loras: character.loras ? await Promise.all(character.loras.map(l => encryptLora(l, buffer))) : []
    }
}

function encryptLora(lora: Lora, buffer: Buffer): Lora {
    return {
        title: encryptMessage(lora.title, buffer),
        url: encryptMessage(lora.url, buffer),
        activation: encryptMessage(lora.activation ?? "", buffer),
    }
}

function decryptLora(lora: Lora, buffer: Buffer): Lora {
    return {
        title: decryptMessage(lora.title, buffer),
        url: decryptMessage(lora.url, buffer),
        activation: decryptMessage(lora.activation ?? "", buffer),
    }
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

export const updateCharacter = async (character: Character): Promise<void> => {

    if(character.is_private && !checkIsEncrypted(character.name)) {
        const key = await getKeyServerSide();
        character = await encryptCharacter(character, key);
    }

    character.tags = character.tags_full?.map(t => t.id);

    delete character.chats;
    delete character.likes;
    delete character.is_liked;
    delete character.tags_full;

    const { error } = await (await createClient())
        .from("characters")
        .update({
            ...character,
            owner: character.owner.user,
            category: character.category?.id,
        })
        .eq("id", character.id);

    if (error) {
        throw error;
    }
}

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