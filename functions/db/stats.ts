
import { API_Count, Stats } from "@/types/db";
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