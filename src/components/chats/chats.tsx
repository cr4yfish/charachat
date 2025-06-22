"use client";

import { API_ROUTES } from "@/lib/apiRoutes";
import { fetcher } from "@/lib/utils";
import { Chat } from "@/types/db";
import { ChatCard } from "./chat-card";
import { useMemo } from "react";
import { TIMINGS_MILLISECONDS } from "@/lib/timings";
import useSWRInfinite from "swr/infinite";
import { Button } from "../ui/button";
import { LIMITS } from "@/lib/limits";
import Spinner from "../ui/spinner";

export default function Chats() {
    const { data, setSize, size, isValidating } = useSWRInfinite<Chat[]>(
        (pageIndex, previousPageData) => {
            // If there is no previous page data, return the first page URL
            if (previousPageData && previousPageData.length === 0) return null;
            const cursor = pageIndex * LIMITS.MAX_CHATS_PER_PAGE; 
            return API_ROUTES.GET_CHATS + `?cursor=${cursor}`; // Fetch all chats
        }, fetcher, {
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, // 1 hour
    }) 

    const chats = useMemo(() => {
        if (!data) return [];
        
        // De-duplicate chats by ID
        const chatMap: Record<string, Chat> = {};
        data.forEach(page => {
            page.forEach(chat => {
                if (!chatMap[chat.id]) {
                    chatMap[chat.id] = chat;
                }
            });
        });
        return Object.values(chatMap);
    }, [data]);

    const handleLoadMore = () => {
        // This function can be used to load more chats if needed
        setSize(size + 1);
    }

    const hasMore = useMemo(() => {
        if (!data || data.length === 0) return false;
        // Check if the last page has less than the limit, which means there are no more chats to load
        const lastPage = data[data.length - 1];
        return lastPage.length >= LIMITS.MAX_CHATS_PER_PAGE;
    }, [data]);

    /**
     * Group chats by date using either last_message_at (might be undefined) or created_at.
     * Sort by:
     * - Today
     * - Yesterday
     * - Last 7 days
     * - Rest
     */
    const dateGroupedChats = useMemo(() => {
        if (!chats) return [];

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

        chats.forEach(chat => {
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
    }, [chats])
    
    return (
        <>
        <div className="flex flex-col items-center justify-start h-screen w-full p-4 pt-[75px] pb-[100px] max-w-[1024px] overflow-y-auto ">

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

            {hasMore && 
                <Button 
                    disabled={isValidating} 
                    onClick={handleLoadMore}
                    variant={"ghost"}
                    className="mb-4"
                    >
                        {isValidating && <Spinner />}
                        {isValidating ? "Loading" : "Load more"}
                </Button>}

        </div>
        </>
    )
}