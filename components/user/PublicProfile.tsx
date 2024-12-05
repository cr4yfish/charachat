"use server";

import { getPublicProfile } from "@/functions/db/profiles";
import { Avatar } from "@nextui-org/avatar";

type Props = {
    userId: string
}

export default async function PublicProfile(props: Props) {

    const profile = await getPublicProfile(props.userId);

    return (
        <>
        <div className="flex flex-col items-center gap-2">
            <Avatar src={profile.avatar_link} className="w-[200px] h-[200px]" />
            <h1 className="text-2xl font-bold" >{profile.username}</h1>
            <p>{profile.public_bio}</p>
        </div>
        </>
    )
}