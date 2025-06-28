"use client";

/**
 * Top bar version for the chat interface.
 * 
 */

import { cn } from "@/lib/utils";
import { ShallowCharacter } from "@/lib/db/types/character";
import { Button } from "../button";
import { ChevronLeftIcon } from "lucide-react";
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChatSettingsDrawer } from "@/components/chat/chat-settings-drawer";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useSidebar } from "../sidebar";
import { useAuth } from "@clerk/nextjs";
import { safeParseLink } from "@/lib/utils/text";

type Props = {
    shallowCharacter: ShallowCharacter | undefined;
    chatId: string;
}

const PureTopBar = (props: Props) => {
    const router = useRouter();
    const { isMobile } = useSidebar();
    const { isSignedIn } = useAuth();
    
    return (
        <>
        <header className={cn("fixed z-50 top-0 left-0 h-[75px] w-full flex flex-row justify-center items-center bg-gradient-to-b from-black/50 to-transparent", { "ml-[260px] pr-[280px]": !isMobile })} >
            <div className="px-4 py-2 ios-safe-header-padding  flex items-center justify-between w-full relative max-w-[1920px] ">
                <div className="flex flex-row items-center gap-1 max-w-3/4 overflow-hidden">
                    <Link href={"/"} onClick={(e) => {
                        e.preventDefault();
                        router.back();
                    }} >
                        <Button size={"icon"} variant={"ghost"} >
                            <ChevronLeftIcon size={12} />
                        </Button>
                    </Link>

                    <div className="flex flex-row items-center gap-2 w-full overflow-hidden">
                        {props.shallowCharacter?.image_link && 
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="size-[28px] rounded-full overflow-hidden relative">
                                <Image 
                                    src={safeParseLink(props.shallowCharacter?.image_link)}
                                    alt=""
                                    fill
                                    className="object-cover rounded-full"
                                />
                            </motion.div>
                        }

                        {props.shallowCharacter?.id ?<Link href={"/c/" + props.shallowCharacter.id} className="font-bold truncate w-full overflow-hiddene  " >
                            {props.shallowCharacter?.name}
                        </Link> :
                        <span>Charachat</span>}
                    </div>
            
                </div>
                
                {isSignedIn && props.shallowCharacter?.id &&
                <ChatSettingsDrawer
                    chatId={props.chatId} 
                    characterId={props.shallowCharacter.id} 
                />}

                <div className="absolute -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>
            </div>
        </header>
        </>
    );
}

export const ChatTopBar = memo(PureTopBar, (prev, next) => {
    if (prev.shallowCharacter?.id !== next.shallowCharacter?.id) return false;
    if (prev.chatId !== next.chatId) return false;
    
    return true;
});
