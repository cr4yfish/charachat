
import { Stats } from "@/types/db";
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