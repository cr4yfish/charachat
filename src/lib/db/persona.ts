/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";
import { createServerSupabaseClient as createClient, createUnauthenticatedServerSupabaseClient } from "./server";
import { LoadMoreProps } from "@/lib/db/types";
import { Persona } from "@/lib/db/types/persona";
import { checkIsEncrypted, encryptMessage } from "../crypto/client";
import { decryptMessageBackwardsCompatible, getKeyServerSide } from "../crypto/server";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { unstable_cache } from "next/cache";
import { LIMITS } from "../constants/limits";
import { TIMINGS } from "../constants/timings";
import { currentUser } from "@clerk/nextjs/server";
import { SortType } from "@/app/search/page";

const personaMatcher = `
    *,
    profiles (*)
`

const tableName = "personas";

const personaFormatter = async (data: any): Promise<Persona> => {
    const profile = data.profiles;
    
    delete data.profiles;

    const persona: Persona = {
        ...data,
        creator: profile
    }

    return persona;
}

const privatePersonaFormatter = async (data: any): Promise<Persona> => {
    const profile = data.profiles;
    
    delete data.profiles;

    const persona: Persona = {
        ...data,
        creator: profile
    }

    if(persona.is_private) {

        if(!checkIsEncrypted(persona.full_name)) {
            await updatePersona(persona);
            return persona;
        }

        try {
            const key = await getKeyServerSide();
            return await decryptPersona(persona, key);
        } catch {
            console.error(ERROR_MESSAGES.CRYPTO_ERROR);
            return persona;
        }
       
    }

    return persona;
}

export const decryptPersona = async (persona: Persona, key: Buffer): Promise<Persona> => {

    try {
        return {
            ...persona,
            full_name: await decryptMessageBackwardsCompatible(persona.full_name, key),
            bio: persona.bio ? await decryptMessageBackwardsCompatible(persona.bio, key) : undefined,
            avatar_link: persona.avatar_link ? await decryptMessageBackwardsCompatible(persona.avatar_link, key) : undefined
        }
    } catch {
        console.error(ERROR_MESSAGES.CRYPTO_ERROR);
        return persona;
    }
}

export const encryptPersona = async (persona: Persona, key: string): Promise<Persona> => {
    try {
     const keyBuffer = Buffer.from(key, "hex");
     return {
        ...persona,
        full_name: encryptMessage(persona.full_name, keyBuffer),
        bio: persona.bio ? encryptMessage(persona.bio, keyBuffer) : undefined,
        avatar_link: persona.avatar_link ? encryptMessage(persona.avatar_link, keyBuffer) : undefined
     }   
    } catch (error) {
        console.error("Error encrypting persona", error);
        return persona;
    }
}

export const getPersona = cache(async (personaId: string) => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select(personaMatcher)
        .eq("id", personaId)
        .single();

    if (error) {
        console.error("Error fetching single persona", error);
        throw error;
    }

    return await privatePersonaFormatter(data);
})

export const getPersonas = cache(async (props: LoadMoreProps, sort?: SortType) => {
    let query = (await createUnauthenticatedServerSupabaseClient())
        .from(tableName)
        .select(personaMatcher)
        .eq("is_private", false) // Only fetch public personas

    // Apply sorting based on the sort parameter
    switch (sort) {
        // not implemented yet
        case 'newest':
        case 'likes':
        case 'relevance':
        case 'popular':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    const { data, error } = await query.range(props.cursor, props.cursor + props.limit - 1)
        
    if (error) {
        console.error("Error fetching personas", error);
        return [];
    }

    return await Promise.all(data.map(personaFormatter));
})

export const getOwnPersonas = cache(async (props: LoadMoreProps) => {
    const user = await currentUser();

    if( !user || !user.id) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await (await createClient())
        .from(tableName)
        .select(personaMatcher)
        .eq("clerk_user_id", user.id)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1)
        
    if (error) {
        console.error("Error fetching personas", error);
        return [];
    }

    return await Promise.all(data.map(privatePersonaFormatter));
})


export async function getCachedInitialPersonas() {
    return await unstable_cache(
        async () => await getPersonas({
            cursor: 0, limit: LIMITS.MAX_PERSONAS_PER_PAGE
        }),
        ["personas-cursor-0"], // Cache key
        {
            revalidate: TIMINGS.ONE_DAY, // Revalidate every hour
            tags: ["personas-cursor-0"] // Tag for cache invalidation
        }
    )();
}

export const getUserPersonas = cache(async (props: LoadMoreProps) => {
    const { data: { user } } = await (await createClient()).auth.getUser();

    if(!user?.id) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await (await createClient())
        .from(tableName)
        .select(personaMatcher)
        .eq("creator", user.id)
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        console.error("Error fetching user personas", error);
        throw error;
    }

    return await Promise.all(data.map(privatePersonaFormatter));
})

export const getPublicUserPersonas = cache(async (props: LoadMoreProps) => {
    if(!props.args?.userId) {
        throw new Error("No user id provided");
    }

    const { data, error } = await (await createClient())
        .from(tableName)
        .select(personaMatcher)
        .eq("creator", props.args.userId)
        .eq("is_private", false)
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        console.error("Error fetching public user personas", error);
        throw error;
    }

    return await Promise.all(data.map(personaFormatter));
})

export const searchPersonas = cache(async (search: string) => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select(personaMatcher)
        .ilike("full_name", `%${search}%`);

    if (error) {
        console.error("Error searching personas", error);
        throw error;
    }

    return await Promise.all(data.map(personaFormatter));
})

export const updatePersona = async (persona: Persona) => {
    if(persona.is_private && !checkIsEncrypted(persona.full_name)) {
        const key = await getKeyServerSide();
        persona = await encryptPersona(persona, key.toString());
    }

    const { error } = await (await createClient())
        .from(tableName)
        .update({
            full_name: persona.full_name,
            bio: persona.bio,
            avatar_link: persona.avatar_link,
            is_private: persona.is_private
        })
        .eq("id", persona.id);

    if (error) {
        console.error("Error updating persona", error);
        throw error;
    }
}

export const createPersona = async (persona: Persona): Promise<void> => {

    if(persona.is_private) {
        // encrypt
        const key = await getKeyServerSide();
        persona = await encryptPersona(persona, key.toString());
    }

    const { error } = await (await createClient())
        .from(tableName)
        .insert({
            ...persona,
            creator: persona.creator.user
        });

    if (error) {
        console.error("Error creating persona", error);
        throw error;
    }
}

export const deletePersona = async (personaId: string): Promise<void> => {
    const { error } = await (await createClient())
        .from(tableName)
        .delete()
        .eq("id", personaId);

    if (error) {
        console.error("Error deleting persona", error);
        throw error;
    }
}