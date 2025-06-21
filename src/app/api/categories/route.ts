import { getCategories } from "@/lib/db/categories";
import { LIMITS } from "@/lib/limits";
import { TIMINGS } from "@/lib/timings";
import { unstable_cache } from "next/cache";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor') || '0';
    const limit = url.searchParams.get('limit') || LIMITS.MAX_CATEGORIES_PER_PAGE.toString();
    const args = url.searchParams.get('args') ? JSON.parse(url.searchParams.get('args') as string) : undefined;
    
    const res = await unstable_cache(
        async () => await getCategories({ cursor: parseInt(cursor, 10), limit: parseInt(limit, 10), args: args }), 
        [`categories-cursor-${cursor}`], 
    {
        revalidate: TIMINGS.ONE_DAY, // Cache for one hour
        tags: ['categories', `categories-cursor-${cursor}`],
    })();

    return Response.json(res);
}