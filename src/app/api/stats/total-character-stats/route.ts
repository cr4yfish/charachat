import { getStats } from "@/lib/db/stats";
import { TIMINGS } from "@/lib/timings";
import { unstable_cache } from "next/cache";


export async function GET() {

    const stats = await unstable_cache(
        async () => await getStats("num_characters"),
        ["num_characters"],
        {
            tags: ["stats", "num_characters"],
            revalidate: TIMINGS.ONE_DAY, // 24 hours
        }   
    )();

    if (!stats || stats.length === 0) {
        return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    console.log("Fetched total character stats:", stats[0]);
    return Response.json(stats[0]);
}