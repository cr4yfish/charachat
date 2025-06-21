"use client";

import { createClient } from "@supabase/supabase-js";

type Options = {
    session?: {
        getToken: () => Promise<string | null>;
    };
}

/**
 * Creates a Supabase client with the provided session options.
 * 
 * This function is useful for integrating Supabase with Clerk for authentication.
 * @param options 
 * @returns 
 */
export function createSupabaseClient(options?: Options) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
            async accessToken() {
                return options?.session?.getToken() ?? null
            }
        }
    )
}