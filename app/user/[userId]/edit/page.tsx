"use server";

import EditProfile from "@/components/user/EditProfile";
import { getCurrentUser } from "@/functions/db/auth";
import { Profile } from "@/types/db";
import { redirect } from "next/navigation";


export default async function EditUserPage() {

    let profile: Profile | undefined = undefined
    try {
        profile = await getCurrentUser();
    } catch (error) {
        console.error(error);
        redirect("/auth");
    }


    return (
        <div className="flex flex-col px-4 py-6 gap-4">
            <div className="flex flex-row items-center gap-2">
                <h1 className=" font-bold text-4xl">Edit User</h1>
            </div>
         
            <EditProfile profile={profile} />

        </div>
    );
}