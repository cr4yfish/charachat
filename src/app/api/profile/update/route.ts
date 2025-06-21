import { updateProfile } from "@/lib/db/profile";
import { currentUser } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";


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
    } catch (error) {
        console.error("Error updating profile:", error);
        return Response.json({ message: "Failed to update profile" }, { status: 500 });
    }

    // revalidate the profile cache for this user
    revalidateTag('user-profile-' + user.id);
    return Response.json({ message: "Profile updated successfully" }, { status: 200 });
}