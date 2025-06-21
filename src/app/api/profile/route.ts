import { getProfile } from "@/lib/db/profile";
import { TIMINGS } from "@/lib/timings";
import { unstable_cache } from "next/cache";

/**
 * Fetch user profile by ID.
 * 
 * Cache aggressively for two hours.
 * Revalidate on a per-user basis.
 * 
 * @param request 
 * @returns 
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if(!id) {
        return Response.json({ message: "User id required" }, { status: 403 });
    }
    
    const profile = await unstable_cache(
        async () => {
            return await getProfile(id)
        },
        ['user-profile-'+id], // cache key
        {
            revalidate: TIMINGS.ONE_HOUR, // cache for two hours
            tags: ['user', 'user-profile-'+id]
        }
    )();

    if(!profile) {
        return Response.json({ message: "No profile found" }, { status: 200 });
    }

    return Response.json(profile);
}
