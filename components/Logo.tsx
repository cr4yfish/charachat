import { BotIcon } from "lucide-react"
import ConditionalLink from "./utils/ConditionalLink"

type Props = {
    hideTextOnMobile?: boolean;
    hasLink?: boolean;
    className?: string;
    hideText?: boolean;
}

export default function Logo(props: Props) {
    return (
        <ConditionalLink fullWidth href="/" active={props.hasLink ? true : false} className={`flex flex-row items-center gap-2 ${props.className}`}>
            <BotIcon size={24} />
            {!props.hideText && <span className={`text-lg font-bold ${props.hideTextOnMobile && "max-sm:hidden"}`}>charachat</span>}
        </ConditionalLink>
        
    )
}