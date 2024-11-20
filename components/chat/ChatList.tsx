"use client";

import { Character, Chat } from "@/types/db";
import { useEffect, useState } from "react";

import { ScrollArea } from "../ui/scroll-area";
import ChatCard from "./ChatCard";

type Props = {
    initChats: Chat[];
    character: Character
}

export default function ChatList(props: Props) {    
    const [chats, setChats] = useState(props.initChats);

    useEffect(() => {

        // sort by last message at on chats changes

        setChats((prev) => {
            return prev.sort((a, b) => {
                return new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime();
            });
        });

    }, [chats])

    return (
        <>
        <div className="flex flex-col gap-2">
            <h2 className="prose dark:prose-invert font-bold text-xl">Your Chats with {props.character.name}</h2>
            <ScrollArea className="h-fit">
                <div className="flex flex-col gap-2 h-fit">
                    {chats.map((chat) => (
                        <ChatCard 
                            key={chat.id} 
                            data={chat} 
                            setChats={setChats}
                        />
                    ))}
                </div>
            </ScrollArea>
            {chats?.length == 0 && (
                <p className="dark:prose-invert dark:text-slate-400">You have no chats with this character.</p>   
            )}
        </div>
        </>
    )

}