import { getKeyServerSide } from "@/lib/crypto/server";
import { decryptProfile, getProfile } from "@/lib/db/profile";
import { TIMINGS } from "@/lib/timings";
import { currentUser } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

/**
 * Fetches the current user's profile.
 * 
 * Cache aggressively for two hours.
 * Revalidate on a per-user basis.
 * 
 * @param request 
 * @returns 
 */
export async function GET() {
    const user = await currentUser();
    const id = user?.id;

    if(!id) {
        return Response.json({ message: "User id required" }, { status: 403 });
    }
    
    const profile = await unstable_cache(
        async () => {
            return await getProfile(id)
        },
        ['user-profile-'+id], // cache key
        {
            revalidate: TIMINGS.ONE_MINUTE, // cache for two hours
            tags: ['user', 'user-profile-'+id]
        }
    )();

    if(!profile) {
        return Response.json({ message: "No profile found" }, { status: 200 });
    }

    // Decrypt the profile
    const key = await getKeyServerSide();
    const decryptedProfile = await decryptProfile(profile, key)
    
    return Response.json(decryptedProfile);
}
