
import { API_Count, Leaderboard, Stats } from "@/types/db";
import { createClient } from "@/utils/supabase/supabase";
import { cache } from "react";

export const getStats = cache(async (tableName: string): Promise<Stats[]> => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select('*')
        .range(0, 30)

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

export const getLeaderboard = cache(async (): Promise<Leaderboard[]> => {
    const { data, error } = await (await createClient())
        .from('character_creator_leaderboard')
        .select('*')
        .neq("total_chat_count", 0)
        .order("total_chat_count", { ascending: false })
        .range(0, 10)

    if (error) {
        throw new Error(error.message)
    }

    return data
})

export const getLeaderboardPosition = cache(async (id: string): Promise<Leaderboard> => {
    const { data, error } = await (await createClient())
        .from('character_creator_leaderboard')
        .select('*')
        .eq("user", id)

    if (error) {
        throw new Error(error.message)
    }

    return data[0]
})

export const getOwnLeaderboardPosition = cache(async (): Promise<Leaderboard> => {
    const client = await createClient();
    const { data: { user }} = await client.auth.getUser();

    if(!user?.id) throw new Error("User not found");

    return await getLeaderboardPosition(user.id)
})