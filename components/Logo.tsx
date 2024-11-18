import { BotIcon } from "lucide-react"

export default function Logo() {
    return (
        <div className="flex flex-row items-center gap-2 w-fit">
            <BotIcon size={24} />
            <span className="text-lg font-bold">charachat</span>
        </div>
        
    )
}