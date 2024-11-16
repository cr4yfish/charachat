/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase"


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