import { getCharactersByCategory } from "@/lib/db/character";
import { LIMITS } from "@/lib/limits";
import { TIMINGS } from "@/lib/timings";
import { unstable_cache } from "next/cache";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const cursor = parseInt(url.searchParams.get("cursor") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || LIMITS.MAX_CHARACTERS_PER_PAGE.toString(), 10);

    if (!categoryId) {
        return Response.json({ error: "Category ID is required" }, { status: 400 });
    }

    try {
        const res = await unstable_cache(
            async () => await getCharactersByCategory({ cursor, limit, args: { categoryId } }),
            [`characters-category-${categoryId}-cursor-${cursor}`],
            {
                revalidate: TIMINGS.ONE_HOUR, // Cache for one hour
                tags: ['characters', `characters-category-${categoryId}`],
            }
        )();
        return Response.json(res);
    } catch (error) {
        console.error("Error fetching characters by category:", error);
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}