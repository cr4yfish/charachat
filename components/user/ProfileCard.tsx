"use client";

import {User} from "@nextui-org/user";

import { Profile } from "@/types/db";


type Props = {
    profile?: Profile
}

export default function ProfileCard(props: Props) {

    return (
        <>
        <User   
            name={props.profile ? (props.profile.first_name + " " + props.profile.last_name) : "Anon user"}
            description={props.profile ? `@${props.profile.user}` : "Not logged in"}
            avatarProps={{
                src: props.profile?.avatar_link,
            }}
            />
        </>
    )
}