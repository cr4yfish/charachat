/**
 * For use in the explore/personalized section
 *  Displays the latest chat with a character
 *  If no chat is available, returns null
 */


"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { Chat } from "@/types/db";
import { CarouselItem } from "../ui/carousel";
import ChatCardSmall from "../chats/chat-card-small";

const PureLatestChat = () => {
    const { data: latestChat, isLoading } = useSWR<Chat>(API_ROUTES.GET_LATEST_CHAT, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR
    })

    if (isLoading || !latestChat) return null; // Return null while loading

    return (
        <CarouselItem className="min-lg:basis-1/3">
            <ChatCardSmall chat={latestChat} />
        </CarouselItem>
    )
}

export const LatestChat = PureLatestChat; // Exporting the component for use in other parts of the application
export default LatestChat; // Default export for the component