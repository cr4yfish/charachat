"use client";

/**
 * Top bar version for the chat interface.
 * 
 */

import { cn } from "@/lib/utils";
import { ShallowCharacter } from "@/types/db";
import { Button } from "../button";
import { ChevronLeftIcon } from "lucide-react";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChatSettings } from "@/components/chat/chat-settings";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

type Props = {
    shallowCharacter: ShallowCharacter;
    chatId: string;
    userId?: string | undefined;
}

const PureTopBar = (props: Props) => {
    const router = useRouter();
    
    return (
        <>
        <header className={cn("fixed z-50 top-0 left-0 h-[75px] w-full px-4 py-2 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent")} >

  
            <div className="flex flex-row items-center gap-1">
                <Link href={"/"} onClick={(e) => {
                    e.preventDefault();
                    router.back();
                }} >
                    <Button size={"icon"} variant={"ghost"} >
                        <ChevronLeftIcon size={12} />
                    </Button>
                </Link>

                <div className="flex flex-row items-center gap-2">
                    {props.shallowCharacter?.image_link && 
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="size-[28px] rounded-full overflow-hidden relative">
                            <Image 
                                src={props.shallowCharacter?.image_link}
                                alt=""
                                fill
                                className="object-cover rounded-full"
                            />
                        </motion.div>
                    }

                    <span className="font-bold truncate " >
                        {props.shallowCharacter?.name}
                    </span>
                </div>
           
            </div>
            

 

            {props.userId !== undefined && 
            <ChatSettings 
                chatId={props.chatId} 
                characterId={props.shallowCharacter?.id} 
            />}

            <div className="absolute -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>

        </header>
        </>
    );
}

export const ChatTopBar = memo(PureTopBar, (prev, next) => {
    if (prev.shallowCharacter.id !== next.shallowCharacter.id) return false;
    if (prev.chatId !== next.chatId) return false;
    if (prev.userId !== next.userId) return false;
    return true;
});
