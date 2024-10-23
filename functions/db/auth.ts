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

    profile.user = user;

    return profile;
})