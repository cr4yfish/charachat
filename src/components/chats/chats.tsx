"use client";

import { API_ROUTES } from "@/lib/apiRoutes";
import { fetcher } from "@/lib/utils";
import { Chat } from "@/types/db";
import useSWR from "swr";
import { ChatCard } from "./chat-card";
import { useMemo } from "react";
import { TIMINGS_MILLISECONDS } from "@/lib/timings";

export default function Chats() {
    const { data } = useSWR<Chat[]>(API_ROUTES.GET_CHATS, fetcher, {
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, // 1 hour
        focusThrottleInterval: TIMINGS_MILLISECONDS.ONE_MINUTE, // 1 minute
    }) 

    /**
     * Group chats by date using either last_message_at (might be undefined) or created_at.
     * Sort by:
     * - Today
     * - Yesterday
     * - Last 7 days
     * - Rest
     */
    const dateGroupedChats = useMemo(() => {
        if (!data) return [];

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);

        const grouped: Record<string, Chat[]> = {
            "Today": [],
            "Yesterday": [],
            "Last 7 Days": [],
            "Older": []
        };

        data.forEach(chat => {
            const date = chat.last_message_at || chat.created_at;
            if (!date) return;

            const chatDate = new Date(date);
            if (chatDate.toDateString() === today.toDateString()) {
                grouped["Today"].push(chat);
            } else if (chatDate.toDateString() === yesterday.toDateString()) {
                grouped["Yesterday"].push(chat);
            } else if (chatDate >= last7Days) {
                grouped["Last 7 Days"].push(chat);
            } else {
                grouped["Older"].push(chat);
            }
        });

        return Object.entries(grouped).map(([key, chats]) => ({
            date: key,
            chats
        }));
    }, [data])
    
    return (
        <>
        <div className="flex flex-col items-center justify-start h-screen w-full p-4 py-[75px] overflow-y-auto ">

            {dateGroupedChats.map(({ date, chats }) => (
                chats.length > 0 && (
                    <div key={date} className="w-full mb-4">
                        <h2 className="text-xs text-muted-foreground">{date}</h2>
                        {chats.length > 0 && (
                            chats.map(chat => (
                                <ChatCard key={chat.id} chat={chat} />
                            ))
                        )}
                    </div>
                )
            ))}

        </div>
        </>
    )
}