/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase"
import { Profile } from "@/types/db";
import { getKeyServerSide } from "../serverHelpers";
import { checkIsEncrypted, decryptMessage, encryptMessage } from "@/lib/crypto";
import { deleteAccount } from "./auth";

export const encryptProfile = async (profile: Profile, key: string): Promise<Profile> => {
    try {
        const keyBuffer = Buffer.from(key, "hex");

        return {
            ...profile,
            first_name: encryptMessage(profile.first_name, keyBuffer),
            last_name: encryptMessage(profile.last_name ?? "", keyBuffer),
            bio: encryptMessage(profile.bio ?? "", keyBuffer),
        }
    } catch (error) {
        console.error("Error encrypting profile", error);
        return profile;
    }
}


export const decryptProfile = async (profile: Profile, key: string): Promise<Profile> => {
    try {
        const keyBuffer = Buffer.from(key, "hex");

        return {
            ...profile,
            first_name: decryptMessage(profile.first_name, keyBuffer),
            last_name: decryptMessage(profile.last_name ?? "", keyBuffer),
            bio: decryptMessage(profile.bio ?? "", keyBuffer),
        }
    } catch (error) {
        console.error("Error decrypting profile", error);
        return profile;
    }
}

const profileFormatter = async (db: any): Promise<Profile> => {
    const { data: { session } } = await createClient().auth.getSession();

    if((session?.user?.id === db.user) && !checkIsEncrypted(db.first_name)) {
        console.error("Profile is not encrypted. Fixing...");
        const key = await getKeyServerSide();
        const encrypted = await encryptProfile(db, key);
        await updateProfile(encrypted);
        return db;
    }

    const key = await getKeyServerSide();
    return await decryptProfile(db, key);
}


export const getProfile = cache(async (userId: string) => {
    const { data, error } = await createClient()
        .from("profiles")
        .select(`*`)
        .eq("user", userId)
        .single();

    if (error) {
        console.error("Error fetching single profile", error);
        throw error;
    }

    return await profileFormatter(data);
})

export const updateProfile = async (profile: Profile) => {
    const { error } = await createClient()
        .from("profiles")
        .upsert(profile);

    if (error) {
        console.error("Error updating profile", error);
        throw error;
    }
}

export const addTokens = async (userId: string, tokens: number) => {
    const { error } = await createClient()
        .from("profiles")
        .upsert({
            user: userId,
            tokens: tokens ?? 0
        });

    if (error) {
        console.error("Error adding tokens", error);
        throw error;
    }
}

export const getTokens = async (userId: string): Promise<number> => {
    const { data, error } = await createClient()
        .from("profiles")
        .select("tokens")
        .eq("user", userId)
        .single();

    if (error) {
        console.error("Error fetching tokens", error);
        throw error;
    }

    return data.tokens;
}

export const getUserTier = cache(async (userId: string) => {
    const { data, error } = await createClient()
        .from("user_tier")
        .select("tier")
        .eq("user", userId)
        .single();

    if (error) {
        console.error("Error fetching user tier", error);
        throw error;
    }

    return data.tier;   
})

export const deleteUser = async () => {
    const { data: { user } } = await createClient().auth.getUser();

    if(!user?.id) {
        throw new Error("User not found");
    }

    const { error } = await createClient()
        .from("profiles")
        .delete()
        .eq("user", user.id);

    if (error) {
        console.error("Error deleting user", error);
        throw error;
    }

    await deleteAccount();
}