import { createClient } from "@/utils/supabase/supabase";
import { cache } from "react";
import { getProfile } from "./profiles";
import { Profile } from "@/types/db";


export const getCurrentUser = cache(async (): Promise<Profile> => {
    const { data: { user } } = await createClient().auth.getUser();

    if(!user) {
        throw new Error("No user found");
    }

    const profile = await getProfile(user.id);

    return profile;
})

export const getSession = cache(async () => {
    const { data: session, error } = await createClient().auth.getSession();

    if(error) {
        throw error;
    }

    return session;
})