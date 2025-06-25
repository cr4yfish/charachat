import { getPublicUserCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/constants/limits";
import { TIMINGS } from "@/lib/constants/timings";
import { unstable_cache } from "next/cache";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_CHARACTERS_PER_PAGE.toString();
    
    const res = await unstable_cache(
        async () => await getPublicUserCharacters({
            cursor: parseInt(cursor, 10),
            limit: parseInt(limit, 10),
            args: {
                userId: userId
            },
        }),
        [`public-characters-${userId}-cursor-${cursor}`],
        {
            revalidate: TIMINGS.ONE_HOUR, // cache for one hour
            tags: ['characters', `popular-characters-${userId}-cursor-${cursor}`],
        }
    )();

    return Response.json(res);
}