import { Profile } from "@/types/db"
import ConditionalLink from "../utils/ConditionalLink"
import { Avatar } from "@nextui-org/avatar"
import { safeParseLink } from "@/lib/utils"

type Props = {
    profile: Profile,
    hasLink?: boolean,
    textSize?: "xs" | "sm" | "md" | "lg" | "xl",
    onlyName?: boolean,
    hasImage?: boolean,
    fullWidth?: boolean
}

export default function Username(props: Props) {

    return (
        <>
        <ConditionalLink active={props.hasLink ?? false} href={`/user/${props.profile.user}`} className={`flex items-center gap-1 ${props.fullWidth && "w-full"}`}>
            {props.hasImage && <Avatar src={safeParseLink(props.profile.avatar_link)} alt="" className="w-[20px] h-[20px]" />}
            <p className={` dark:text-zinc-400 text-${props.textSize ?? "xs"}`}>{props.onlyName ? "" : "By @"} {props.profile.username}</p>
        </ConditionalLink>
        </>
    )
}