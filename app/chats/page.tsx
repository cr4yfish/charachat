"use server";

import ChatCard from "@/components/chat/ChatCard";
import ChatCardSmallSkeleton from "@/components/chat/ChatCardSmallSkeleton";
import InfiniteListLoader from "@/components/InfiniteListLoader";
import { getChats } from "@/functions/db/chatList";

export default async function Page() {

    // const chats = await getChats({ cursor: 0, limit: 25 });

    return (
        <>
        <div className="flex flex-col items-center gap-4 px-4 py-6 w-full h-full">

            <div className="w-full max-w-xl flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Your chats</h1>
                </div>
                
            </div>

            {/* <InfiniteListLoader 
                initialData={chats}
                loadMore={getChats}
                limit={5}
                component={ChatCard}
                skeleton={<ChatCardSmallSkeleton />}
                componentProps={{ hasLink: true }}
            /> */}
    
        </div>
        </>
    )
}