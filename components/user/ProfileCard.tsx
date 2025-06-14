"use server";

import Link from "next/link";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { getCurrentUser } from "@/functions/db/auth";
import { Profile } from "@/types/db";
import { User } from "../ui/user";

export default async function ProfileCard() {
    let profile: Profile | undefined = undefined;
    
    try {
        profile = await getCurrentUser();
    } catch (e) {
        const err = e as Error;
        // Anons are allowed here, not an error
        if(err.message !== "No user found") {
            console.error("Error in ProfileCard", e);
        };
        return <></>
    }

    return (
        <>
        <div className="flex flex-row items-center justify-between w-full">
            
            <User   
                name={profile ? (profile.first_name + " " + profile.last_name) : "Anon user"}
                description={profile ? `@${profile?.username}` : "Not logged in"}
                avatarProps={{
                    src: profile?.avatar_link,
                }}
            />
            <Link href={`/settings`}>
                <Button isIconOnly color="warning" variant="flat"><Icon>edit</Icon></Button>
            </Link>
        </div>
        </>
    )
}