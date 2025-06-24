import { getCharacter, getCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/constants/limits";
import { TIMINGS } from "@/lib/constants/timings";
import { unstable_cache } from "next/cache";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_CHARACTERS_PER_PAGE.toString();
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    const id = url.searchParams.get('id');

    /**
     * Only get a character by ID if the ID is provided.
     */
    if (id) {
        const character = await getCharacter(id);
        return Response.json(character);
    }

    const res = await unstable_cache(
        async () => await getCharacters({
            cursor: parseInt(cursor, 10),
            limit: parseInt(limit, 10),
            args: args,
        }),
        [`characters-cursor-${cursor}`],
        {
            revalidate: TIMINGS.ONE_HOUR, // Cache for one hour
            tags: ['characters', `characters-cursor-${cursor}`],
        }
    )();
    if (!res) {
        return Response.json({ error: "No characters found" }, { status: 404 });
    }

    return Response.json(res);
}