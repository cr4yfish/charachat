"use server";

import EditProfile from "@/components/user/EditProfile";
import { getCurrentUser, logout } from "@/functions/db/auth";
import { checkIsEncrypted } from "@/lib/crypto";
import { Profile } from "@/types/db";


export default async function EditUserPage() {

    let profile: Profile | undefined = undefined
    try {
        profile = await getCurrentUser();

        if(checkIsEncrypted(profile.first_name)) {
            await logout();
            throw new Error("Profile is encrypted. Please log in again to decrypt it.");
        }
    } catch {
        console.error("Error fetching profile");
        return (
            <>
            <h1>Didnt find a logged in user.</h1>
            </>
        )
    }

    return (
        <div className="max-h-full w-full overflow-y-auto">
            <div className="h-fit w-full relative flex flex-col px-4 py-6 gap-4 pb-20">
                <div className="flex flex-row items-center gap-2">
                    <h1 className=" font-bold text-4xl">Your Profile</h1>
                </div>
            
                <EditProfile profile={profile} />
            </div>
        </div>
    );
}