/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createServerSupabaseClient as createClient, createUnauthenticatedServerSupabaseClient } from "./server";
import { Character } from "@/types/db";
import { LoadMoreProps } from "@/types/db";
import { safeParseLink } from "@/lib/utils/text";
import { encryptMessage } from "../crypto/client";
import { currentUser } from "@clerk/nextjs/server";
import { decryptMessageBackwardsCompatible, getKeyServerSide } from "../crypto/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { LIMITS } from "../constants/limits";
import { TIMINGS } from "../constants/timings";
import { Vibrant } from "node-vibrant/node";
import { getProfile } from "./profile";
import { ERROR_MESSAGES } from "../constants/errorMessages";

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

    if(char.is_private) {
        return await decryptCharacter(char, await getKeyServerSide());
    }

    return char;
}

const privateCharacterFormatter = async (db: any | undefined): Promise<Character> => {
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

    let char = {
        ...db,
        owner: owner,
        category: category,
        is_liked: false,
        tags_full: JSON.stringify(db?.tags_full) === "[null]" ? undefined : db?.tags_full
    } as Character;
    
    char = await decryptCharacter(char, await getKeyServerSide());

    return char;
}

export const decryptCharacter = async (character: Character, key: Buffer): Promise<Character> => {
    try {
        return {
            ...character,
            name: await decryptMessageBackwardsCompatible(character.name ?? " ", key),
            description: await decryptMessageBackwardsCompatible(character.description ?? " ", key),
            intro: await decryptMessageBackwardsCompatible(character.intro ?? "", key),
            bio: await decryptMessageBackwardsCompatible(character.bio ?? "ll", key),
            book: await decryptMessageBackwardsCompatible(character.book ?? " ", key),
            image_link: await decryptMessageBackwardsCompatible(character.image_link ?? " ", key),
            personality: await decryptMessageBackwardsCompatible(character.personality ?? " ", key),
            system_prompt: await decryptMessageBackwardsCompatible(character.system_prompt ?? " ", key),
            image_prompt: await decryptMessageBackwardsCompatible(character.image_prompt ?? " ", key),
            first_message: await decryptMessageBackwardsCompatible(character.first_message ?? " ", key),
            speaker_link: await decryptMessageBackwardsCompatible(character.speaker_link ?? " ", key),
            scenario: await decryptMessageBackwardsCompatible(character.scenario ?? " ", key),
            // tags_full: (character.tags_full) ? await Promise.all(character.tags_full.map(t => decryptTag(t))) : [],
            // loras: character.loras ? await Promise.all(character.loras.map(l => decryptLora(l, buffer))) : []
        }
    } catch {
        console.error(ERROR_MESSAGES.CRYPTO_ERROR);
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
    
    const profile = await getProfile(user.id);

    if (!profile || !profile.user) {
        throw new Error("createCharacter: During the Beta phase you must have migrated your account from v1");
    }

    const { data, error } = await (await createClient())
        .from("characters")
        .insert({
            ...char,
            // TEMP WORKAROUND FOR TESTING PHASE
            // TODO: REMOVE THIS 
            owner: profile?.user, 
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

/**
 * Gets [LIMIT] amount of characters starting from a random cursor.
 */
export const getRandomCharacters = cache(async (limit = 60): Promise<Character[]> => {
    // Get a larger pool of characters to randomize from
    const randomCursor = Math.floor(Math.random() * limit);

    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
        .from(publicTableName)
        .select(characterMatcher)
        .eq("is_private", false)
        .eq("is_unlisted", false)
        .range(randomCursor, randomCursor + limit - 1)
        
    if (error) {
        throw error;
    }

    // Shuffle the array using Fisher-Yates algorithm
    const shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take the requested slice from the shuffled array
    const selectedData = shuffled.slice(randomCursor, randomCursor + limit);

    return Promise.all(selectedData.map(async (db: any) => {
        return await characterFormatter(db);
    }));
})

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
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await privateCharacterFormatter(db);
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

/**
 * @deprecated
 * @param characterId 
 */
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

/**
 * @deprecated
 * @param characterId 
 */
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


export const bookmarkCharacter = async (characterId: string): Promise<void> => {
    const user = await currentUser();
    if(!user?.id) {
        throw new Error("bookmarkCharacter: User not found");
    }
    const { error } = await (await createClient())
        .from("character_bookmarks")
        .insert({
            character: characterId,
            clerk_user_id: user.id
        });
    if (error) {
        console.error("Error bookmarking character", error);
        throw error;
    }
    revalidateTag("bookmarked-characters");
}

export const removeBookmarkCharacter = async (characterId: string): Promise<void> => {
    const user = await currentUser();
    if(!user?.id) {
        throw new Error("removeBookmarkCharacter: User not found");
    }
    const { error } = await (await createClient())
        .from("character_bookmarks")
        .delete()
        .eq("character", characterId)
        .eq("clerk_user_id", user.id);
    if (error) {
        console.error("Error removing bookmark character", error);
        throw error;
    }
    revalidateTag("bookmarked-characters");
}

export const getBookmarkedCharacters = cache(async (props: LoadMoreProps): Promise<Character[]> => {
    const user = await currentUser();

    if(!user?.id) {
        throw new Error("getLikedCharacters: User not found");
    }

    const { data, error } = await (await createClient())
        .from("character_bookmarks")
        .select(`
            *,
            characters!character_bookmarks_character_fkey (*)
        `)
        .eq("clerk_user_id", user.id)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async (db: any) => {
        return await privateCharacterFormatter(db.characters as any);
    }));
})

export const searchCharactersByTags = cache(async (
    tags: string[], 
    sort: 'newest' | 'likes' | 'relevance' | 'popular' = 'relevance',
    limit: number = 20
): Promise<Character[]> => {
    if (!tags || tags.length === 0) {
        return [];
    }

    // Create search conditions for each tag across multiple fields
    const searchConditions = tags.map(tag => 
        `name.ilike.*${tag}*,description.ilike.*${tag}*,bio.ilike.*${tag}*,intro.ilike.*${tag}*,book.ilike.*${tag}*,personality.ilike.*${tag}*,scenario.ilike.*${tag}*,tags_full.cs.{${tag}}`
    ).join(',');

    let query = (await createUnauthenticatedServerSupabaseClient())
        .from(publicTableName)
        .select("*")
        .or(searchConditions)
        .limit(limit);

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

export const searchCharactersByAITags = cache(async (
    keywords: string[], 
    options: {
        sort?: 'newest' | 'likes' | 'relevance' | 'popular';
        limit?: number;
        includeNSFW?: boolean;
        exactMatch?: boolean;
    } = {}
): Promise<Character[]> => {
    const { 
        sort = 'relevance', 
        limit = 20, 
        includeNSFW = false,
        exactMatch = false 
    } = options;

    if (!keywords || keywords.length === 0) {
        return [];
    }

    // Clean and prepare keywords
    const cleanedKeywords = keywords
        .map(keyword => keyword.trim().toLowerCase())
        .filter(keyword => keyword.length > 0);

    if (cleanedKeywords.length === 0) {
        return [];
    }

    // Build search conditions based on match type
    let searchConditions: string;
    
    if (exactMatch) {
        // Exact match for more precise results
        searchConditions = cleanedKeywords.map(keyword => 
            `name.ilike.%${keyword}%,description.ilike.%${keyword}%,personality.ilike.%${keyword}%,scenario.ilike.%${keyword}%,bio.ilike.%${keyword}%`
        ).join(',');
    } else {
        // Fuzzy match for broader results
        searchConditions = cleanedKeywords.map(keyword => 
            `name.ilike.*${keyword}*,description.ilike.*${keyword}*,bio.ilike.*${keyword}*,intro.ilike.*${keyword}*,book.ilike.*${keyword}*,personality.ilike.*${keyword}*,scenario.ilike.*${keyword}*`
        ).join(',');
    }

    let query = (await createUnauthenticatedServerSupabaseClient())
        .from(publicTableName)
        .select("*")
        .or(searchConditions)
        .limit(limit);

    // Filter NSFW content if not included
    if (!includeNSFW) {
        query = query.eq('is_nsfw', false);
    }

    // Apply sorting
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
            // Order by created_at for now, could be enhanced with actual relevance scoring
            query = query.order('created_at', { ascending: false });
            break;
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    const characters = await Promise.all(data.map(async (db: any) => {
        return await characterFormatter(db);
    }));

    // If using relevance sort, we could add client-side scoring here
    if (sort === 'relevance') {
        return characters.sort((a, b) => {
            const scoreA = calculateRelevanceScore(a, cleanedKeywords);
            const scoreB = calculateRelevanceScore(b, cleanedKeywords);
            return scoreB - scoreA;
        });
    }

    return characters;
})

// Helper function to calculate relevance score based on keyword matches
const calculateRelevanceScore = (character: Character, keywords: string[]): number => {
    let score = 0;
    const searchableText = [
        character.name,
        character.description,
        character.personality,
        character.scenario,
        character.bio,
        character.intro,
        character.book
    ].filter(Boolean).join(' ').toLowerCase();

    keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        // Count occurrences of keyword
        const matches = (searchableText.match(new RegExp(keywordLower, 'g')) || []).length;
        score += matches;
        
        // Bonus points for matches in name (more relevant)
        if (character.name?.toLowerCase().includes(keywordLower)) {
            score += 5;
        }
        
        // Bonus points for matches in description
        if (character.description?.toLowerCase().includes(keywordLower)) {
            score += 3;
        }
    });

    return score;
}