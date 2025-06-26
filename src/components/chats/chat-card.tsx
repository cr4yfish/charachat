"use client";

import Link from "next/link"
import { memo } from "react"
import { motion } from "motion/react"
import { prettyPrintDate } from "@/lib/utils/date"
import { prettyRenderSingleMessageContent } from "@/lib/utils/message";
import { safeParseLink, truncateText } from "@/lib/utils/text"
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/card"
import Image from "next/image"
import { Chat } from "@/lib/db/types/chat"
import { ChevronRightIcon } from "lucide-react"
import { Markdown } from "../ui/markdown"
import { cn } from "@/lib/utils";

type Props = {
    chat: Chat;
    small?: boolean;
}

const PureChatCard = ({chat, small}: Props) => {

    return (
        <Link href={`/chat/${chat.id}`}>
            <motion.div className="w-full rounded-3xl overflow-hidden relative">
                <Card className={cn("p-4 w-full bg-transparent border-none hover:bg-muted transition-colors cursor-pointer flex flex-col gap-2 overflow-hidden", { "p-2": small})}>
                    <CardContent className="flex items-center gap-3 p-0 w-full overflow-hidden">
                        <div className={cn("overflow-hidden relative size-14 shrink-0 p-4 rounded-full", {
                            "size-8": small
                        })}>
                            {chat.character.image_link && <Image src={safeParseLink(chat.character.image_link)} alt="" fill className="object-cover object-top" />}
                        </div>
                        
                        <div className="flex flex-col gap-1.5 w-full overflow-hidden">
                            <div className="flex flex-col gap-1 w-full pr-3">
                                <CardTitle className={cn("", { "truncate font-medium ": small })}>{chat.character.name}</CardTitle>
                                {chat.last_message && 
                                    <CardDescription className="max-w-[95%]">
                                        <Markdown className="!text-xs !text-muted-foreground truncate overflow-hidden">
                                            {truncateText(prettyRenderSingleMessageContent(chat.last_message), 32)}
                                        </Markdown>
                                    </CardDescription>  
                                }
                            </div>

                            {(small !== true) &&
                                <CardFooter className="p-0 flex items-center gap-2 text-xs text-muted-foreground">
                                    {chat.last_message_at && <span>{prettyPrintDate(chat.last_message_at, { short: true })}</span>}
                                    {chat.persona?.full_name && <span className="truncate">as {chat.persona.full_name}</span>}
                                </CardFooter>
                            }
                        </div>
                        
                    </CardContent>
                    {(small !== true) && <div className="absolute right-4 top-0 h-full flex items-center justify-center dark:text-neutral-400">
                        <ChevronRightIcon size={14} color="currentColor" />
                    </div>}
                </Card>
            </motion.div>
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