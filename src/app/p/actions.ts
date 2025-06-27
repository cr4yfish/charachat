"use server";

import { getProfile, updateProfile } from "@/lib/db/profile";
import { currentUser } from "@clerk/nextjs/server";
import { setSettingsCookie } from "../actions";

/**
 * Toggles the default persona for the current user.
 * 
 * isDefault is the current state of the persona.
 
 * @param id 
 * @param isDefault 
 * @returns 
 */
export async function setPersonaDefault(id: string, isDefault: boolean) {
    try {
        const user = await currentUser();
        if (!user) {
            throw new Error("User not authenticated");
        }   
        const profile = await getProfile(user.id)
        if(!profile) {
            throw new Error("Profile not found");
        }
        await updateProfile({
            ...profile,
            settings: {
                ...profile.settings,
                default_persona_id: isDefault ? undefined : id,
            }
        })

        await setSettingsCookie(JSON.stringify({
            ...profile.settings,
            default_persona_id: isDefault ? undefined : id,
        }));

        return { success: true };
    } catch (error) {
        console.error("Error setting persona as default:", error);
        return { success: false  };
    }
}