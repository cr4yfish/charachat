import Link from "next/link"
import { memo, useState } from "react"
import { motion } from "motion/react"
import { cn, prettyPrintDate, prettyRenderSingleMessageContent, safeParseLink, truncateText } from "@/lib/utils"
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/card"
import Image from "next/image"
import { Chat } from "@/types/db"
import { setCharacterCookie } from "@/app/actions"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react"
import { Markdown } from "../ui/markdown"

type Props = {
    chat: Chat;
    small?: boolean;
}

const PureChatCard = ({chat, small}: Props) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Link key={chat.id} href={`/chat/${chat.id}`} className="w-full" onClick={(e) => {
            e.preventDefault();
            if(isLoading) return; // Prevent multiple clicks
            setIsLoading(true);
            setCharacterCookie(chat.character.id).then(() => {
                router.push("/chat/" + chat.id);
            })
        }}>
            {small ? 
            <div className="flex flex-row justify-between items-center gap-2 rounded-3xl text-teal-200/80 bg-teal-800 p-4 cursor-pointer hover:bg-teal-700 transition-all duration-200">
                <div className="flex flex-col gap-1">
                    <p className="text-xs">Continue your Chat with</p>
                    <div className="flex items-center gap-1">
                        {chat.character.image_link && 
                        <div className="relative size-[24px] shrink-0 rounded-full overflow-hidden border border-teal-200/80">
                            <Image 
                                src={safeParseLink(chat.character.image_link)}
                                fill alt="" className="object-cover"
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
            :
            <motion.div 
                className="w-full rounded-3xl overflow-hidden relative " 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.99 }}
            >
                <div className={cn("absolute size-full bg-black/0 transition-all pointer-events-none duration-1000 z-10", { "backdrop-blur": isLoading })}></div>
                <Card className="p-4 w-full bg-transparent border-none hover:bg-muted transition-colors cursor-pointer flex flex-col gap-2 overflow-hidden">
                    <CardContent className="flex items-center gap-3 p-0 w-full overflow-hidden">
                        <div className="overflow-hidden relative size-14 shrink-0 p-4 rounded-full">
                            {chat.character.image_link && <Image src={chat.character.image_link} alt="" fill />}
                        </div>
                        
                        <div className="flex flex-col gap-1.5 w-full overflow-hidden">
                            <div className="flex flex-col gap-1 w-full pr-3">
                                <CardTitle>{chat.character.name}</CardTitle>
                                {chat.last_message && 
                                    <CardDescription className="max-w-[95%]">
                                        <Markdown className="!text-xs !text-muted-foreground truncate overflow-hidden">
                                            {truncateText(prettyRenderSingleMessageContent(chat.last_message), 32) || "No messages yet"}
                                        </Markdown>
                                    </CardDescription>  
                                }
                            </div>

                            <CardFooter className="p-0 flex items-center justify-between text-xs text-muted-foreground">
                                {chat.last_message_at && <span>{prettyPrintDate(chat.last_message_at, { short: true })}</span>}
                            </CardFooter>
                        </div>
                        
                    </CardContent>
                    <div className="absolute right-4 top-0 h-full flex items-center justify-center dark:text-neutral-400">
                        <ChevronRightIcon size={14} color="currentColor" />
                    </div>
                    
                </Card>
            </motion.div>}
        </Link>
    )
}

export const ChatCard = memo(PureChatCard, (prevProps, nextProps) => {
    if (prevProps.chat.id !== nextProps.chat.id) {
        return false; // Re-render if chat IDs are different
    }

    if( prevProps.small !== nextProps.small) {
        return false; // Re-render if small prop is different
    }

    return true;
})