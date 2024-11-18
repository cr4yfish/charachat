"use client";

import {User} from "@nextui-org/user";

import { Profile } from "@/types/db";
import Link from "next/link";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";

type Props = {
    profile?: Profile
}

export default function ProfileCard(props: Props) {

    return (
        <>
        <div className="flex flex-row items-center justify-between w-full">
            
            <User   
                name={props.profile ? (props.profile.first_name + " " + props.profile.last_name) : "Anon user"}
                description={props.profile ? `@${props.profile?.username}` : "Not logged in"}
                avatarProps={{
                    src: props.profile?.avatar_link,
                }}
            />
            <Link href={`/user/${props.profile?.user}/edit`}>
                <Button isIconOnly color="warning" variant="flat"><Icon>edit</Icon></Button>
            </Link>
        </div>
        </>
    )
}