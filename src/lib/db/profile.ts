/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";
import { createServerSupabaseClient as createClient, createUnauthenticatedServerSupabaseClient } from "./server";
import { Profile } from "@/types/db";
import { checkIsEncrypted, decryptMessage, encryptMessage } from "../crypto/client";
import { decryptMessageBackwardsCompatible, getKeyServerSide } from "../crypto/server";
import { currentUser } from "@clerk/nextjs/server";

const publicTableName = "profiles_view";

export const encryptProfile = async (profile: Profile, key: Buffer): Promise<Profile> => {
    try {

        // encrypt api keys
        if (profile.api_keys) {
            profile.api_keys = profile.api_keys.map(apiKey => ({
                ...apiKey,
                encrypted_api_key: encryptMessage(apiKey.encrypted_api_key, key)
            }));
        }

        return {
            ...profile,
            first_name: encryptMessage(profile.first_name ?? "", key),
            last_name: encryptMessage(profile.last_name ?? "", key),
            bio: encryptMessage(profile.bio ?? "", key),
        }
    } catch (error) {
        console.error("Error encrypting profile", error);
        return profile;
    }
}


export const decryptProfile = async (profile: Profile, key: Buffer): Promise<Profile> => {
    try {

        // decrypt api keys
        if (profile.api_keys) {
            profile.api_keys = profile.api_keys.map(apiKey => ({
                ...apiKey,
                encrypted_api_key: decryptMessage(apiKey.encrypted_api_key, key)
            }));
        }

        return {
            ...profile,
            first_name: await decryptMessageBackwardsCompatible(profile.first_name ?? "", key),
            last_name: await decryptMessageBackwardsCompatible(profile.last_name ?? "", key),
            bio: await decryptMessageBackwardsCompatible(profile.bio ?? "", key),
        }
    } catch (error) {
        console.error("Error decrypting profile", error);
        return profile;
    }
}

const profileFormatter = async (db: any): Promise<Profile> => {
    try {
        const user = await currentUser();
        const key = await getKeyServerSide();
        if((user?.id === db.user) && !checkIsEncrypted(db.first_name)) {
            console.error("Profile is not encrypted. Fixing...");
            const encrypted = await encryptProfile(db, key);
            await updateProfile(encrypted);
            return db;
        }

        return await decryptProfile(db, key);
    } catch (error) {
        console.error("Error formatting profile", error);
        throw error;
    }
}


export const getProfile = cache(async (userid: string) => {
    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
        .from("profiles")
        .select(`*`)
        .eq("clerk_user_id", userid)
        .single();

    if (error) {
        console.error("Error fetching single profile", error);
        return undefined;
    }

    return data as Profile;
})

export const getPublicProfile = cache(async (userId: string): Promise<Profile> => {
    const { data, error } = await (await createClient())
        .from(publicTableName)
        .select(`*`)
        .eq("user", userId)
        .single();

    if (error) {
        console.error("Error fetching single profile", error);
        throw error;
    }

    return data;
})

export const updateProfile = async (profile: Profile): Promise<Profile | void> => {
    if(!profile.clerk_user_id) {
        throw new Error("updateProfile: clerk_user_id is required");
    }

    // make sure any api keys are encrypted
    // or encrypt them now if they are not
    if (profile.api_keys) {
        const key = await getKeyServerSide();
        profile.api_keys = profile.api_keys.map(apiKey => ({
            ...apiKey,
            encrypted_api_key: encryptMessage(apiKey.encrypted_api_key, key)
        }));
    }

    const res = await getProfile(profile.clerk_user_id);

    const client = await createClient()

    if(!res) {
        // create a new profile if it doesn't exist
        const { data, error } = await client
            .from("profiles")
            .insert({
                ...profile,
                clerk_user_id: profile.clerk_user_id,
            }).select("*")
            
        if (error || !data || data.length === 0) {
            console.error("Error creating profile", error);
            throw error;
        }

        return profileFormatter(data[0]);
    } else {
        const { error } = await client
            .from("profiles")
            .update(profile)
            .eq("clerk_user_id", profile.clerk_user_id);

        if (error) {
            console.error("Error updating profile", error);
            throw error;
        }
    }
}

export const addTokens = async (userId: string, tokens: number) => {
    const { error } = await (await createClient())
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
    const { data, error } = await (await createClient())
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
    const { data, error } = await (await createClient())
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
    const { data: { user } } = await (await createClient()).auth.getUser();

    if(!user?.id) {
        throw new Error("deleteuser: User not found");
    }

    const { error } = await (await createClient())
        .from("profiles")
        .delete()
        .eq("user", user.id);

    if (error) {
        console.error("Error deleting user", error);
        throw error;
    }

    // const { error: deleteError } = await deleteAccount();

    // if(deleteError) {
    //     console.error("Error deleting account", deleteError);
    //     throw new Error("Error deleting account");
    // }
}