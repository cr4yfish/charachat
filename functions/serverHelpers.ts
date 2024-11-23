"use server";

import { cookies } from 'next/headers';

export const getKeyServerSide = async (): Promise<string> => {
    const cookiesStore = cookies();
    const key = cookiesStore.get('key')?.value;

    if(!key) {
        throw new Error("Key not found in cookies");
    }

    return key;
}


export async function searchFandomPages(search: string) {
    const res = await fetch(`https://community.fandom.com/wiki/Special:Search?query=${search}&scope=cross-wiki`);
    return res.text();
}

export async function getFandomPage(url: string) {
    const res = await fetch(url);
    return res.text();
}