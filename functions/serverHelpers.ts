"use server";

import { generateKey } from '@/lib/crypto';
import { cookies } from 'next/headers';

export const getKeyServerSide = async (): Promise<string> => {
    const cookiesStore = await cookies();
    const key = cookiesStore.get('key')?.value;

    if(!key) {
        throw new Error("Key not found in cookies");
    }

    return key;
}

export const setKeyCookie = async (password: string, email: string) => {
    const keyBuffer = generateKey(password, email);
    (await cookies()).set("key", keyBuffer.toString("hex"), { secure: true, sameSite: "strict", priority: "high", maxAge: 60 * 60 * 24 * 365 });
    return keyBuffer;
}

export const removeKeyCookie = async () => {
    (await cookies()).set("key", "", { secure: true, sameSite: "strict", priority: "high", maxAge: 0 });
}

export async function searchFandomPages(search: string) {
    const res = await fetch(`https://community.fandom.com/wiki/Special:Search?query=${search}&scope=cross-wiki`);
    return res.text();
}

export async function getFandomPage(url: string) {
    const res = await fetch(url);
    return res.text();
}

export async function searchAICharacterCards(search: string) {
    const res = await fetch(`https://aicharactercards.com/wp-admin/admin-ajax.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=handle_dacts_ajax_search&term=${search}&categories=&tags=any`
    });
    
    return res.text();
}

export async function getAICharacterCard(url: string) {
    const res = await fetch(url);
    return res.text();
}

export async function searchJanitor(search: string) {
    const res = await fetch("https://jannyai.com/?query=" + search)
    return res.text();
}

export async function getJanitor(url: string, options: RequestInit = {}) {
    const res = await fetch(url, options);
    return res.text();
}