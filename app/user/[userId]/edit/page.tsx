"use server";

import EditProfile from "@/components/user/EditProfile";
import BackLink from "@/components/utils/BackLink";
import { getCurrentUser } from "@/functions/db/auth";


export default async function EditUserPage() {

    const profile = await getCurrentUser();

    return (
        <div className="flex flex-col px-4 py-6 gap-4">
            <div className="flex flex-row items-center gap-2">
                <BackLink />
                <h1 className=" font-bold text-4xl">Edit User</h1>
            </div>
         
            <EditProfile profile={profile} />

        </div>
    );
}