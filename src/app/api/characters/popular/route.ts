import { getPopularCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/limits";
import { TIMINGS } from "@/lib/timings";
import { unstable_cache } from "next/cache";


/**
 * Fetch first page of popular characters with caching.
 */
export const getCachedPopularCharacters = unstable_cache(
    async () => {
        return await getPopularCharacters({
            cursor: 0,
            limit: LIMITS.MAX_CHARACTERS_PER_PAGE,
            args: undefined,
        });
    },
    ['popular-characters-cursor-0'],
    {
        revalidate: TIMINGS.ONE_HOUR, // cache for one hour
        tags: ['characters', 'popular-characters-cursor-0'],
    }
);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_CHARACTERS_PER_PAGE.toString();
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    
    const res = await unstable_cache(
        async () => await getPopularCharacters({
            cursor: parseInt(cursor, 10),
            limit: parseInt(limit, 10),
            args: args,
        }),
        [`popular-characters-cursor-${cursor}`],
        {
            revalidate: TIMINGS.ONE_HOUR, // cache for one hour
            tags: ['characters', `popular-characters-cursor-${cursor}`],
        }
        )();

    return Response.json(res);
}