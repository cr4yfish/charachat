/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase"
import { Profile } from "@/types/db";


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

    return data;
})

export const updateProfile = async (profile: Profile) => {
    const { data, error } = await createClient()
        .from("profiles")
        .upsert(profile);

    if (error) {
        console.error("Error updating profile", error);
        throw error;
    }

    return data;
}

export const addTokens = async (userId: string, tokens: number) => {
    const { data, error } = await createClient()
        .from("profiles")
        .upsert({
            user: userId,
            tokens: tokens
        });

    if (error) {
        console.error("Error adding tokens", error);
        throw error;
    }

    return data;
}