import { Profile } from "@/types/db"
import ConditionalLink from "../utils/ConditionalLink"

type Props = {
    profile: Profile,
    hasLink?: boolean,
    textSize?: "xs" | "sm" | "md" | "lg" | "xl"
}

export default function Username(props: Props) {

    return (
        <>
        <ConditionalLink active={props.hasLink ?? false} href={`/user/${props.profile.user}`}>
            <p className={` dark:text-zinc-400 text-${props.textSize ?? "xs"}`}>By @{props.profile.username}</p>
        </ConditionalLink>
        </>
    )
}