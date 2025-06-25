"use server";

import { COOKIE_NAMES } from "@/lib/constants/cookieNames";
import { Persona } from "@/lib/db/types/persona";
import { cookies } from "next/headers";

export async function saveDraftPersonaCookie(persona: Persona): Promise<boolean> {
    const cookieStore = await cookies();
    if(!persona.id || !persona.full_name || persona.full_name.length === 0) {
        await clearDraftPersonaCookie();
        return false;
    }

    cookieStore.set(COOKIE_NAMES.DRAFT_PERSONA, JSON.stringify(persona));
    return true;
}

export async function clearDraftPersonaCookie() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.DRAFT_PERSONA, "");
}

export async function getDraftPersonaFromCookie(): Promise<Persona | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAMES.DRAFT_PERSONA);

    if (cookie?.value) {
        const tmp = JSON.parse(cookie.value);
        if(tmp && tmp.id && tmp.name) {
            return tmp as Persona;
        } else {
            // If the cookie is malformed or missing required fields, clear it
            console.warn("Draft Persona cookie is malformed or missing required fields. Clearing cookie.");
            await clearDraftPersonaCookie();
            return null;
        }
    } else {
        return null;
    }
}