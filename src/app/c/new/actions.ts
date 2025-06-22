"use server";

import { ImportCharType } from "@/components/new-character/import/importer";
import { COOKIE_NAMES } from "@/lib/cookieNames";
import { TIMINGS } from "@/lib/timings";
import { Character } from "@/types/db";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import * as cheerio from 'cheerio';

export async function saveDraftCharacterInCookie(character: Character): Promise<boolean> {
    const cookieStore = await cookies();
    if(!character.id || !character.name || character.name.length === 0) {
        await clearDraftCharacterCookie();
        return false;
    }

    cookieStore.set(COOKIE_NAMES.DRAFT_CHARACTER, JSON.stringify(character));
    return true;
}

export async function clearDraftCharacterCookie() {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.DRAFT_CHARACTER, "");
}

export async function getDraftCharacterFromCookie(): Promise<Character | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAMES.DRAFT_CHARACTER);

    if (cookie?.value) {
        const tmp = JSON.parse(cookie.value);
        if(tmp && tmp.id && tmp.name) {
            return tmp as Character;
        } else {
            // If the cookie is malformed or missing required fields, clear it
            console.warn("Draft character cookie is malformed or missing required fields. Clearing cookie.");
            await clearDraftCharacterCookie();
            return null;
        }
    } else {
        return null;
    }
}

/**
 * Importers
 */

export async function searchAnime(search: string): Promise<ImportCharType[]> {

    const query = `
        query ($search: String!) {
            Page {
                characters(search: $search) {
                    id,
                    name {
                        full
                    },
                    image {
                        medium
                    },
                    description,
                    media {
                        nodes {
                            title {
                                romaji
                            },
                            description,
                            type
                        }
                    }
                }
            }
        }
    `

    const res = await unstable_cache(
        async () => {
            const res = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        search: search
                    }
                })
            });

            if (!res.ok) {
                console.error("Failed to fetch from Anilist:", res.statusText);
                throw new Error("Failed to fetch from Anilist");
            }

            return await res.json();
        }, 
        [`search-anime-${search}`], 
        {
            revalidate: TIMINGS.SIX_HOURS // Cache for 1 hour
        }
    )();

    type Char = {
        id: number;
        name: {
            full: string;
        };
        image: {
            medium: string;
        };
        description: string;
        media: {
            nodes: Array<{
                title: {
                    romaji: string;
                },
                type: string;
                description: string;
            }>
        },
        gender: string,
        dateOfBirth: {
            year: number;
            month: number;
            day: number;
        }
    }

    type AnimeImportResponse = {
        data: {
            Page: {
                characters: Char[];
            }
        }
    }

    const json: AnimeImportResponse = res;

    console.log("Anime search results:", json);

    if(!json || !Array.isArray(json) || json.length === 0) {
        console.warn("No characters found for search:", search);
    }

    // convert the response to ImportCharType
    const characters: ImportCharType[] = json.data.Page.characters.map(character => ({
        sourceId: character.id.toString(),
        name: character.name.full,
        description: character.description,
        imageLink: character.image.medium,
        tags: character.media.nodes.map(media => media.title.romaji),
        source: "Anilist"
    }));

    return characters;

}

export async function searchFandomPages(search: string) {
    const res = await fetch(`https://community.fandom.com/wiki/Special:Search?query=${search}&scope=cross-wiki`);
    return res.text();
}

export async function searchSillyTavern(search: string): Promise<ImportCharType[]> {
    const text = await unstable_cache(
        async () => {
            const res = await fetch(`https://aicharactercards.com/wp-admin/admin-ajax.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=handle_dacts_ajax_search&term=${search}&categories=&tags=any`
            });

            if (!res.ok) {
                console.error("Failed to fetch from SillyTavern:", res.statusText);
                throw new Error("Failed to fetch from SillyTavern");
            }

            return await res.text();
        },
        [`search-silly-tavern-${search}`],
        {
            revalidate: TIMINGS.SIX_HOURS // Cache for 6 hours
        }
    )();

    const $ = cheerio.load(text);

    const results: ImportCharType[] = [];
    
    const listItems = $(".list-group a");

    listItems.each((i, el) => {
        const $el = $(el);

        const tags = $el.find("small").map((i, tagEl) => $(tagEl).text().trim()).get();

        results.push({
            name: $el.find("h5").text().trim(),
            description: $el.find("p").text().trim(),
            imageLink: $el.find("img").attr("src") || "",
            tags: $el.find("small").map((i, tagEl) => $(tagEl).text().trim()).get(),
            source: "SillyTavern",
            sourceId: $el.find("h5").text().trim() || "",
            nsfw: tags.some(tag => tag.toLowerCase().includes("nsfw")) // Check if any tag includes "nsfw",
        } as ImportCharType);
    });

    if (results.length === 0) {
        console.warn("No characters found for SillyTavern search:", search);
    }

    return results;

}

export async function searchJanitor(search: string): Promise<ImportCharType[]> {
    const html = await unstable_cache(
        async () => {
            const res = await fetch("https://jannyai.com/?query=" + search)

            if (!res.ok) {
                console.error("Failed to fetch from JanitorAI:", res.statusText);
                throw new Error("Failed to fetch from JanitorAI");
            }

            return res.text();
        },
        [`search-janitor-${search}`],
        {
            revalidate: TIMINGS.SIX_HOURS // Cache for 6 hours
        }
    )();

    const $ = cheerio.load(html);
    const results: ImportCharType[] = [];

    const listItems = $("body .grid a");

    listItems.each((i, el) => {
        const $el = $(el);

        const tags = $el.find("li").map((i, tagEl) => $(tagEl).find("span").text().trim()).get();
        results.push({
            name: $el.find("h5").text().trim(),
            description: $el.find("p").text().trim(),
            imageLink: $el.find("img").attr("src") || "",
            tags: tags,
            source: "JanitorAI",
            sourceId: $el.attr("href") || "",
            nsfw: tags.some(tag => tag.toLowerCase().includes("nsfw")) // Check if any tag includes "nsfw"
        } as ImportCharType);
    });

    return results;
}