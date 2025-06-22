/**
 * For use in the explore/personalized section
 *  Displays the latest chat with a character
 *  If no chat is available, returns null
 */


"use client";

import { API_ROUTES } from "@/lib/apiRoutes";
import { TIMINGS_MILLISECONDS } from "@/lib/timings";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { ChatCard } from "../chats/chat-card";
import { Chat } from "@/types/db";
import { CarouselItem } from "../ui/carousel";

const PureLatestChat = () => {
    const { data: latestChat, isLoading } = useSWR<Chat>(API_ROUTES.GET_LATEST_CHAT, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR
    })

    if (isLoading || !latestChat) return null; // Return null while loading

    return (
        <CarouselItem>
            <ChatCard chat={latestChat} small />
        </CarouselItem>
    )
}

export const LatestChat = PureLatestChat; // Exporting the component for use in other parts of the application
export default LatestChat; // Default export for the component