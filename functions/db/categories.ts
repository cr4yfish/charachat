/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Category } from "@/types/db";

export const searchCategories = cache(async (search: string): Promise<Category[]> => {
    const { data, error } = await createClient()
        .from("categories")
        .select("*")
        .ilike("title", `%${search}%`);

    if (error) {
        throw error;
    }

    return data;
})

export const getCategories = cache(async (cursor: number, limit: number): Promise<Category[]> => {
    const { data, error } = await createClient()
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true })
        .range(cursor, cursor + limit - 1);

    if (error) {
        throw error;
    }

    return data;

})