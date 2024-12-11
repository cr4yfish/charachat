"use server";

import {User} from "@nextui-org/user";
import Link from "next/link";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import { getCurrentUser } from "@/functions/db/auth";

export default async function ProfileCard() {
    const profile = await getCurrentUser();

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
            <Link href={`/user/edit`}>
                <Button isIconOnly color="warning" variant="flat"><Icon>edit</Icon></Button>
            </Link>
        </div>
        </>
    )
}