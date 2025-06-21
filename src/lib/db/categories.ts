"use server";

import { cache } from "react";

import { createServerSupabaseClient as createClient, createUnauthenticatedServerSupabaseClient } from "./server";
import { Category } from "@/types/db";
import { LoadMoreProps } from "@/types/db";
import { unstable_cache } from "next/cache";
import { LIMITS } from "../limits";
import { TIMINGS } from "../timings";

export const searchCategories = cache(async (search: string): Promise<Category[]> => {
    const { data, error } = await (await createClient())
        .from("categories")
        .select("*")
        .ilike("title", `%${search}%`);

    if (error) {
        throw error;
    }

    return data;
})

export const getCategories = cache(async (props: LoadMoreProps): Promise<Category[]> => {
    const { data, error } = await (await createUnauthenticatedServerSupabaseClient())
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return data;

})

export async function getCachedInitialCategories() {
    return await unstable_cache(
        async () => await getCategories({ cursor: 0, limit: LIMITS.MAX_CATEGORIES_PER_PAGE, args: undefined }),
        ['categories-cursor-0'],
        {
            revalidate: TIMINGS.ONE_DAY, // Cache for one hour
            tags: ['categories', 'categories-cursor-0'],
        }
    )();
}