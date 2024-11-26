/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Category } from "@/types/db";
import { LoadMoreProps } from "@/types/client";

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

export const getCategories = cache(async (props: LoadMoreProps): Promise<Category[]> => {
    const { data, error } = await createClient()
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return data;

})