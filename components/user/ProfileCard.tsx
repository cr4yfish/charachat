"use client";

import {User} from "@nextui-org/user";

import { Profile } from "@/types/db";


type Props = {
    profile: Profile
}

export default function ProfileCard(props: Props) {

    return (
        <>
        <User   
            name={props.profile.first_name + " " + props.profile.last_name}
            description={<>@{props.profile.username}</>}
            avatarProps={{
                src: props.profile.avatar_link,
            }}
            />
        </>
    )
}