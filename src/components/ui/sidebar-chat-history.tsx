"use client"

import { useChats } from "@/hooks/use-chats"
import Spinner from "./spinner";
import { ChatCard } from "../chats/chat-card";
import { SidebarMenu } from "./sidebar";
import Link from "next/link";
import { Button } from "./button";
import { ChevronRightIcon } from "lucide-react";

/**
 * Chat history for the sidebar.
 * Only shows up if the user is logged in
 * 
 * Does not have infinite scrolling since /chats usage is encouraged.
 * Thus only dispaly the latest few chats.
 */


export default function SidebarChatHistory() {
    const { chats, isLoading } = useChats(5);


    return (
        <SidebarMenu>
            {(chats && chats.length > 0) && <span className="text-muted-foreground text-xs px-2 pt-2">Latest Chats</span>}

            <div className="flex flex-col gap-2">
                {isLoading && <Spinner />}
                {chats?.map(chat => <ChatCard chat={chat} small key={chat.id} />)}
                
                {chats && chats.length > 0 && (
                    <Link href={"/chats"}>
                        <Button variant={"ghost"} className="flex items-center gap-2 w-full rounded-3xl text-white/75">
                            <span>All chats</span>
                            <ChevronRightIcon size={14} />
                        </Button>
                    </Link>
                )}

            </div>
        </SidebarMenu>

    )
}