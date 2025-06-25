import { getPersonas } from "@/lib/db/persona";
import { LIMITS } from "@/lib/constants/limits";
import { unstable_cache } from "next/cache";
import { TIMINGS } from "@/lib/constants/timings";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_PERSONAS_PER_PAGE.toString();
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    
    const res = await unstable_cache(
        async () => await getPersonas({
            cursor: parseInt(cursor, 10),
            limit: parseInt(limit, 10),
            args
        }),
        [`personas-cursor-${cursor}`],
        {
            revalidate: TIMINGS.ONE_DAY, // 1 hour
            tags: ['personas'],
        }
    )();

    return Response.json(res);
}