import { BotIcon } from "lucide-react"

type Props = {
    hideTextOnMobile?: boolean;
}

export default function Logo(props: Props) {
    return (
        <div className="flex flex-row items-center gap-2 w-fit">
            <BotIcon size={24} />
            <span className={`text-lg font-bold ${props.hideTextOnMobile && "max-sm:hidden"}`}>charachat</span>
        </div>
        
    )
}