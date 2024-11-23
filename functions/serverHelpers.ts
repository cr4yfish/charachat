"use server";


export async function searchFandomPages(search: string) {
    const res = await fetch(`https://community.fandom.com/wiki/Special:Search?query=${search}&scope=cross-wiki`);
    return res.text();
}

export async function getFandomPage(url: string) {
    const res = await fetch(url);
    return res.text();
}