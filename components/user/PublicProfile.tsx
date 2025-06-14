"use server";

import { getPublicProfile } from "@/functions/db/profiles";
import { getLeaderboardPosition } from "@/functions/db/stats";
import Icon from "../utils/Icon";

type Props = {
    userId: string
}

export default async function PublicProfile(props: Props) {

    const profile = await getPublicProfile(props.userId);
    const leaderboardPosition = await getLeaderboardPosition(props.userId);

    return (
        <>
        <div className="flex flex-col items-center gap-2">
            <Avatar src={profile.avatar_link} className="w-[200px] h-[200px]" />
            <h1 className="text-2xl font-bold" >{profile.username}</h1>
            <p>{profile.public_bio}</p>
            <div className="flex flex-col gap-2 flex-wrap w-full">
                <p className="flex items-center gap-1"><Icon filled>cake</Icon> {new Date(profile.created_at ?? "").toLocaleDateString()}</p>
                <p className="flex items-end gap-1"><Icon filled>leaderboard</Icon>{leaderboardPosition.position} on Leaderboard</p>
            </div>
        </div>
        </>
    )
}