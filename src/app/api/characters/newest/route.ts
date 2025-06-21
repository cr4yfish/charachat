import { getCharacters } from "@/lib/db/character";
import { LIMITS } from "@/lib/limits";
import { TIMINGS } from "@/lib/timings";
import { unstable_cache } from "next/cache";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_CHARACTERS_PER_PAGE.toString();
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    
    const res = await unstable_cache(
        async () => await getCharacters({
            cursor: parseInt(cursor, 10),
            limit: parseInt(limit, 10),
            args: args,
        }), 
        [`newest-characters-cursor-${cursor}`], 
        {
            revalidate: TIMINGS.ONE_HOUR,
            tags: ['characters', `newest-characters-cursor-${cursor}`,],
        }
    )();

    return Response.json(res);
}