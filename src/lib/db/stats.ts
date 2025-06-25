
import type { Stats, API_Count, Leaderboard, LoadMoreProps } from "@/lib/db/types";
import { createUnauthenticatedServerSupabaseClient as createClient } from "./server";
import { cache } from "react";

export const getStats = cache(async (tableName: string, limit=30): Promise<Stats[]> => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select('*')
        .range(0, limit)

    if (error) {
        throw new Error(error.message)
    }
    return data
})

export const getAPIKeyCount = cache(async (): Promise<API_Count[]> => {
    const { data, error } = await (await createClient())
        .from('api_keys_count')
        .select('*')
        .order("count", { ascending: false })

    if (error) {
        throw new Error(error.message)
    }

    return data
})

export const getLeaderboard = cache(async (props: LoadMoreProps): Promise<Leaderboard[]> => {
    const { data, error } = await (await createClient())
        .from('character_creator_leaderboard')
        .select('*')
        .neq("total_chat_count", 0)
        .order("total_chat_count", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1)

    if (error) {
        throw new Error(error.message)
    }

    return data
})