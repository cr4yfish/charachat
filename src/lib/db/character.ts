/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createServerSupabaseClient as createClient, createUnauthenticatedServerSupabaseClient } from "./server";
import { Character } from "@/types/db";
import { LoadMoreProps } from "@/types/db";
import { safeParseLink } from "@/lib/utils";
import { decryptMessage, encryptMessage } from "../crypto/client";
import { currentUser } from "@clerk/nextjs/server";
import { getKeyServerSide } from "../crypto/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { LIMITS } from "../limits";
import { TIMINGS } from "../timings";
import { Vibrant } from "node-vibrant/node";

const characterMatcher = `
    *,
    profiles!characters_owner_fkey (*),
    categories!characters_category_fkey (*)
`

const characterTableName = "character_overview"
const publicTableName = "character_overview_public"

const characterFormatter = async (db: any | undefined): Promise<Character> => {
    const owner = db?.profiles;
    const category = db?.categories;
    
    delete db?.profiles;
    delete db?.categories;

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
        tags_full: JSON.stringify(db?.tags_full) === "[null]" ? undefined : db?.tags_full
    } as Character;

    return char;
}

export const decryptCharacter = async (character: Character, key: Buffer): Promise<Character> => {
    try {
        return {
            ...character,
            name: decryptMessage(character.name ?? " ", key),
            description: decryptMessage(character.description ?? " ", key),
            intro: decryptMessage(character.intro ?? "", key),
            bio: decryptMessage(character.bio ?? " ", key),
            book: decryptMessage(character.book ?? " ", key),
            image_link: decryptMessage(character.image_link ?? " ", key),
            personality: decryptMessage(character.personality ?? " ", key),
            system_prompt: decryptMessage(character.system_prompt ?? " ", key),
            image_prompt: decryptMessage(character.image_prompt ?? " ", key),
            first_message: decryptMessage(character.first_message ?? " ", key),
            speaker_link: decryptMessage(character.speaker_link ?? " ", key),
            scenario: decryptMessage(character.scenario ?? " ", key),
            // tags_full: (character.tags_full) ? await Promise.all(character.tags_full.map(t => decryptTag(t))) : [],
            // loras: character.loras ? await Promise.all(character.loras.map(l => decryptLora(l, buffer))) : []
        }
    } catch (error) {
        console.error("Error decrypting character", error);
        return character;
    }

}

export const encryptCharacter = async (character: Character, key: Buffer): Promise<Character> => {

    return {
        ...character,
        name: encryptMessage(character.name ?? " ", key),
        description: encryptMessage(character.description ?? " ", key),
        intro: encryptMessage(character.intro ?? "", key),
        bio: encryptMessage(character.bio ?? " ", key),
        book: encryptMessage(character.book ?? " ", key),
        image_link: encryptMessage(character.image_link ?? " ", key),
        personality: encryptMessage(character.personality ?? " ", key),
        system_prompt: encryptMessage(character.system_prompt ?? " ", key),
        image_prompt: encryptMessage(character.image_prompt ?? " ", key),
        first_message: encryptMessage(character.first_message ?? " ", key),
        speaker_link: encryptMessage(character.speaker_link ?? " ", key),
        scenario: encryptMessage(character.scenario ?? " ", key),
        // tags_full: character.tags_full ? await Promise.all(character.tags_full.map(t => encryptTag(t))) : [],
        // loras: character.loras ? await Promise.all(character.loras.map(l => encryptLora(l, buffer))) : []
    }
}

export const createCharacter = async (newChar: Character): Promise<Character> => {
    const user = await currentUser();

    if(!user || !user.id) {
        throw new Error("createCharacter: User not found");
    }

    const key = await getKeyServerSide();

    let char: Character = newChar;

    if(newChar.is_private) {
        char = await encryptCharacter(newChar, key);
    }
    

    const { data, error } = await (await createClient())
        .from("characters")
        .insert({
            ...char,
            // TEMP WORKAROUND FOR TESTING PHASE
            // TODO: REMOVE THIS 
            owner: process.env.MIGRATION_HELPER_USER_ID!, 
            owner_clerk_user_id: user.id,
            is_private: newChar.is_private ?? false,
            is_unlisted: newChar.is_unlisted ?? false
        })
        .select(characterMatcher)
        .single();

    revalidateTag("characters");
    revalidateTag("spotlight");

    if (error) {
        console.error("Error creating character", error);
        throw error;
    }

    return await characterFormatter(data);
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

export const getShallowCharacter = cache(async (characterId: string): Promise<Character> => {
    const { data, error } = await (await createClient())
        .from("character_quick_view")
        .select(`*`)
        .eq("id", characterId)
        .single();

    if (error) {
        console.error("Error fetching single character", error);
        throw error;
    }

    return await characterFormatter(data);
})


export const getCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
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
    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
        .from(publicTableName)
        .select("*")
        // .or('image_link.ilike.%.png, image_link.ilike.%.jpg, image_link.ilike.%.jpeg')
        .order("created_at", { ascending: false })
        .eq("is_nsfw", false)
        .range(0, 3)

    if (error) {
        throw error;
    }

    return data.find((c) => safeParseLink(c.image_link) !== "");
})

/**
 * Fetch first page of newest characters with caching.
 */
export const getCachedNewestCharacters = unstable_cache(
    async () => {
        return await getCharacters({
            cursor: 0,
            limit: LIMITS.MAX_CHARACTERS_PER_PAGE,
        });
    },
    ['newest-characters-cursor-0'],
    {
        revalidate: TIMINGS.ONE_HOUR,
        tags: ['characters', 'newest-characters-cursor-0'],
    }
);

export const getCachedSpotlight = unstable_cache(
    async () => {
        const character = await getNewestCharacter();
        const imageUrl = safeParseLink(character.image_link);

        const isSupportedUrl = !imageUrl.includes(".webp");

        const palette = isSupportedUrl && await Vibrant.from(imageUrl).getPalette().catch((err) => {
                console.warn("Error getting palette, skipping it:", err, "Character:", character.name);
                return null;
        });

        // convert palette to a simpler object with hex values
        const paletteHex =  {
                Vibrant: palette ? palette.Vibrant?.hex : "#8ec5ff",
                DarkVibrant: palette ?palette.DarkVibrant?.hex  : "#8ec5ff",
                LightVibrant: palette ?palette.LightVibrant?.hex  : "#8ec5ff",
                Muted: palette ? palette.Muted?.hex  : "#8ec5ff",
                DarkMuted: palette ? palette.DarkMuted?.hex  : "#8ec5ff",
                LightMuted: palette ? palette.LightMuted?.hex  : "#8ec5ff",
        };

        return {
                character: {
                        ...character,
                        image_link: imageUrl,
                },
                palette: paletteHex,
        };
    },
    ['spotlight'],
    { revalidate: TIMINGS.ONE_DAY }
);


export const getPopularCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
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

/**
 * Fetch first page of popular characters with caching.
 */
export const getCachedPopularCharacters = unstable_cache(
    async () => {
        return await getPopularCharacters({
            cursor: 0,
            limit: LIMITS.MAX_CHARACTERS_PER_PAGE,
            args: undefined,
        });
    },
    ['popular-characters-cursor-0'],
    {
        revalidate: TIMINGS.ONE_HOUR, // cache for one hour
        tags: ['characters', 'popular-characters-cursor-0'],
    }
);

export const getTrendingCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
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

/**
 * Fetch first page of trending characters with caching.
 */
export const getCachedTrendingInitialCharacters = unstable_cache(
    async () => {
        return await getTrendingCharacters({
            cursor: 0,
            limit: LIMITS.MAX_CHARACTERS_PER_PAGE,
            args: undefined,
        });
    },
    ['trending-characters-cursor-0'],
    {
        revalidate: TIMINGS.ONE_DAY,
        tags: ['characters', 'trending-characters-cursor-0'],
    }
);

export const getCharactersByCategory = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    if(!props.args?.categoryId) {    
        throw new Error("Category ID not found");
    }

    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
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


export async function getInitialCachedCharactersByCategory(categoryId: string) {
    return await unstable_cache(
        async () => await getCharactersByCategory({ cursor: 0, limit: LIMITS.MAX_CHARACTERS_PER_PAGE, args: { categoryId } }),
        [`characters-category-${categoryId}-cursor-0`],
        {
            revalidate: TIMINGS.ONE_HOUR, // Cache for one hour
            tags: ['characters', `characters-category-${categoryId}`],
        }
    )();
}

export const searchCharacters = cache(async (search: string, sort: 'newest' | 'likes' | 'relevance' | 'popular' = 'relevance'): Promise<Character[]> => {
    let query = (await createUnauthenticatedServerSupabaseClient())
        .from(publicTableName)
        .select("*")
        .or(`name.ilike.*${search}*,description.ilike.*${search}*,bio.ilike.*${search}*,intro.ilike.*${search}*,book.ilike.*${search}*,personality.ilike.*${search}*,scenario.ilike.*${search}*`);

    // Apply sorting based on the sort parameter
    switch (sort) {
        case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        case 'likes':
            query = query.order('likes', { ascending: false });
            break;
        case 'popular':
            query = query.order('chats', { ascending: false });
            break;
        case 'relevance':
        default:
            // For relevance, we could implement text search ranking if available
            // For now, fall back to newest as default
            query = query.order('created_at', { ascending: false });
            break;
    }

    const { data, error } = await query;

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
    const user = await currentUser();

    if(!user?.id) {
        throw new Error("getUserChar: User not found");
    }

    const { data, error } = await (await createClient())
        .from(characterTableName)
        .select(characterMatcher)
        .eq("owner_clerk_user_id", user.id)
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

    revalidateTag("characters");
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
