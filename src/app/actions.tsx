"use server";

import { COOKIE_NAMES } from "@/lib/cookieNames";
import { cookies } from "next/headers";


/**
 * Character cookie management functions
 */
export async function setCharacterCookie(id: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.CURRENT_CHARACTER, id);
}

export async function clearCharacterCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.CURRENT_CHARACTER);
}

export async function getCharacterCookie() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.CURRENT_CHARACTER)?.value;
}

/**
 * LLM Model cookie management functions
 */

export async function setLLMModelCookie(model: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.CURRENT_MODEL, model);
}

export async function clearLLMModelCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.CURRENT_MODEL);
}

export async function getLLMModelCookie() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.CURRENT_MODEL)?.value;
}
