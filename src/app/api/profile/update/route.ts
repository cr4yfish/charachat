import { TIMINGS } from "@/lib/constants/timings";
import { updateProfile } from "@/lib/db/profile";
import { ProfileSettings } from "@/lib/db/types/profile";
import { currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";


export async function POST(request: Request) {
    const profile = await request.json();

    const user = await currentUser();

    if (!user || !user.id) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await updateProfile({
            ...profile,
            clerk_user_id: user.id
        });

        // save profile settings to cookies
        const cookieStore = await cookies();
        const profileSettings: ProfileSettings = {
            default_llm: profile.default_llm,
            show_nsfw: profile.settings?.show_nsfw,
        }

        cookieStore.set({
            name: 'profile_settings',
            value: JSON.stringify(profileSettings),
            maxAge: TIMINGS.THIRTY_DAYS, // 30 days
        });

    } catch (error) {
        console.error("Error updating profile:", error);
        return Response.json({ message: "Failed to update profile" }, { status: 500 });
    }

    // revalidate the profile cache for this user
    revalidateTag('user-profile-' + user.id);
    return Response.json({ message: "Profile updated successfully" }, { status: 200 });
}