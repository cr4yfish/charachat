"use server";

import { getChats } from "@/functions/db/chatList";
import ChatCardSmall from "../chat/ChatCardSmall";
import InfiniteListLoader from "../InfiniteListLoader";
import ChatCardSmallSkeleton from "../chat/ChatCardSmallSkeleton";

export default async function SidebarChatListLoader() {

    const chats = await getChats({ cursor: 0, limit: 15 });

    return (
        <>
        <InfiniteListLoader 
            initialData={chats}
            loadMore={getChats}
            limit={15}
            component={ChatCardSmall}
            componentProps={{hasLink: true}}
            skeleton={<ChatCardSmallSkeleton />}
        />
        
        </>
    )
}