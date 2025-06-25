import { safeParseLink } from "@/lib/utils/text";
import { Chat } from "@/lib/db/types/chat";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";


const PureChatCardSmall = ({ chat}: { chat: Chat }) => {

    return (
        <Link href={`/chat/${chat.id}`} className="w-full">
            <div className="flex flex-row justify-between items-center gap-2 rounded-3xl text-teal-200/80 bg-teal-800 p-4 cursor-pointer hover:bg-teal-700 transition-all duration-200">
                <div className="flex flex-col gap-1">
                    <p className="text-xs">Continue your Chat with</p>
                    <div className="flex items-center gap-1">
                        {chat.character.image_link && 
                        <div className="relative size-[24px] shrink-0 rounded-full overflow-hidden border border-teal-200/80">
                            <Image 
                                src={safeParseLink(chat.character.image_link)}
                                fill alt="" className="object-cover object-top"
                            />
                        </div>
                        }
                        <h2 className="font-bold text-white/90">{chat.character.name}</h2>
                    </div>
                    
                </div>
                <div className="flex items-center self-end ">
                    <ArrowRightIcon color="currentColor" className="self-end" />
                </div>
            </div>
        </Link>
    )

}

const ChatCardSmall = memo(PureChatCardSmall, (prevProps, nextProps) => {
    if (prevProps.chat.id !== nextProps.chat.id) {
        return false; // Re-render if chat IDs are different
    }

    return true;
})

export default ChatCardSmall;