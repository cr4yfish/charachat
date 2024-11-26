/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase"
import { Persona } from "@/types/db";
import { checkIsEncrypted, decryptMessage } from "@/lib/crypto";
import { getKeyServerSide } from "../serverHelpers";

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

    if(persona.is_private) {

        if(!checkIsEncrypted(persona.full_name)) {
            console.log("Persona is private but not encrypted");
            await updatePersona(persona);
            return persona;
        }

        try {
            const key = await getKeyServerSide();
            return await decryptPersona(persona, key);
        } catch (error) {
            console.error("Error decrypting persona", error);
            return persona;
        }
       
    }

    return persona;
}

export const decryptPersona = async (persona: Persona, key: string): Promise<Persona> => {

    try {
        const keyBuffer = Buffer.from(key, "hex");
        return {
            ...persona,
            full_name: decryptMessage(persona.full_name, keyBuffer),
            bio: persona.bio ? decryptMessage(persona.bio, keyBuffer) : undefined,
            avatar_link: persona.avatar_link ? decryptMessage(persona.avatar_link, keyBuffer) : undefined
        }
    } catch (error) {
        console.error("Error decrypting persona", error);
        return persona;
    }
}

export const encryptPersona = async (persona: Persona, key: string): Promise<Persona> => {
    try {
     const keyBuffer = Buffer.from(key, "hex");
     return {
        ...persona,
        full_name: decryptMessage(persona.full_name, keyBuffer),
        bio: persona.bio ? decryptMessage(persona.bio, keyBuffer) : undefined,
        avatar_link: persona.avatar_link ? decryptMessage(persona.avatar_link, keyBuffer) : undefined
     }   
    } catch (error) {
        console.error("Error encrypting persona", error);
        return persona;
    }
}

export const getPersona = cache(async (personaId: string) => {
    const { data, error } = await createClient()
        .from(tableName)
        .select(personaMatcher)
        .eq("id", personaId)
        .single();

    if (error) {
        console.error("Error fetching single persona", error);
        throw error;
    }

    return await personaFormatter(data);
})

export const getPersonas = cache(async (cursor: number, limit: number) => {
    const { data, error } = await createClient()
        .from(tableName)
        .select(personaMatcher)
        .range(cursor, cursor + limit - 1);
        
    if (error) {
        console.error("Error fetching personas", error);
        throw error;
    }

    return await Promise.all(data.map(personaFormatter));
})

export const getUserPersonas = cache(async (cursor: number, limit: number) => {
    const { data: { session } } = await createClient().auth.getSession();

    if(!session?.user.id) {
        throw new Error("User not authenticated");
    }

    const { data, error } = await createClient()
        .from(tableName)
        .select(personaMatcher)
        .eq("creator", session.user.id)
        .range(cursor, cursor + limit - 1);

    if (error) {
        console.error("Error fetching user personas", error);
        throw error;
    }

    return await Promise.all(data.map(personaFormatter));
})

export const searchPersonas = cache(async (search: string) => {
    const { data, error } = await createClient()
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
        console.log("Encrypting persona in update");
        const key = await getKeyServerSide();
        persona = await encryptPersona(persona, key);
    }

    const { error } = await createClient()
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
        persona = await encryptPersona(persona, key);
    }

    const { error } = await createClient()
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
    const { error } = await createClient()
        .from(tableName)
        .delete()
        .eq("id", personaId);

    if (error) {
        console.error("Error deleting persona", error);
        throw error;
    }
}