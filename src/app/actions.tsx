"use server";

import { COOKIE_NAMES } from "@/lib/constants/cookieNames";
import { cookies } from "next/headers";

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


/**
 * Persona cookie management functions
 */

export async function setPersonaCookie(persona: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.CURRENT_PERSONA, persona);
}

export async function clearPersonaCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.CURRENT_PERSONA);
}

export async function getPersonaCookie() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.CURRENT_PERSONA)?.value;
}

/**
 * Settings cookie management functions
 */
export async function setSettingsCookie(settings: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.PROFILE_SETTINGS, settings);
}

export async function clearSettingsCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.PROFILE_SETTINGS);
}

export async function getSettingsCookie() {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAMES.PROFILE_SETTINGS)?.value;
}