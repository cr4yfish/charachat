"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { Chat } from "@/types/db";
import { ChatCard } from "./chat-card";
import { useMemo } from "react";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";
import useSWRInfinite from "swr/infinite";
import { Button } from "../ui/button";
import { LIMITS } from "@/lib/constants/limits";
import Spinner from "../ui/spinner";
import ChatCardSkeleton from "./chat-card-skeleton";
import { motion, AnimatePresence } from "motion/react";

export default function Chats() {
    const { data, setSize, size, isValidating, isLoading } = useSWRInfinite<Chat[]>(
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

            <AnimatePresence>
                {(isValidating || isLoading) && 
                    <motion.div 
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1, // Stagger each skeleton by 0.1s
                                    delayChildren: 0.2    // Initial delay before first skeleton
                                }
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    staggerChildren: 0.05,
                                    staggerDirection: -1  // Exit in reverse order
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col gap-4 w-full"
                    >
                        {Array.from({ length: 15}).map((_, index) => (
                            <ChatCardSkeleton key={index} />
                        ))}
                    </motion.div>
                }
                {!isLoading && !isValidating && 
                    <motion.div 
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.2, // Stagger each date group
                                    delayChildren: 0.1    // Initial delay before first group
                                }
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    staggerChildren: 0.1,
                                    staggerDirection: -1  // Exit in reverse order
                                }
                            }
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="w-full mb-4"
                    >            
                        {dateGroupedChats.map(({ date, chats }) => (
                            chats && chats.length > 0 && (
                                <motion.div
                                    key={date}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                staggerChildren: 0.05, // Stagger individual chat cards within each group
                                                delayChildren: 0.1
                                            }
                                        },
                                        exit: {
                                            opacity: 0,
                                            y: -20,
                                            transition: {
                                                staggerChildren: 0.03,
                                                staggerDirection: -1
                                            }
                                        }
                                    }}
                                    className="mb-6"
                                >
                                    <motion.h2 
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 },
                                            exit: { opacity: 0, x: -10 }
                                        }}
                                        className="text-xs text-muted-foreground mb-3 font-medium"
                                    >
                                        {date}
                                    </motion.h2>
                                    {chats.map(chat => (
                                        <motion.div
                                            key={chat.id}
                                            variants={{
                                                hidden: { opacity: 0, y: 10, scale: 0.98 },
                                                visible: { 
                                                    opacity: 1, 
                                                    y: 0, 
                                                    scale: 1,
                                                    transition: {
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 30
                                                    }
                                                },
                                                exit: { 
                                                    opacity: 0, 
                                                    y: -10, 
                                                    scale: 0.98,
                                                    transition: {
                                                        duration: 0.2
                                                    }
                                                }
                                            }}
                                        >
                                            <ChatCard chat={chat} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )
                        ))}
                    </motion.div>
                }
            </AnimatePresence>

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