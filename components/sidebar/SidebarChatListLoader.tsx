"use server";

import { getChats } from "@/functions/db/chat";
import ChatCardSmall from "../chat/ChatCardSmall";
import InfiniteListLoader from "../InfiniteListLoader";

export default async function SidebarChatListLoader() {

    const chats = await getChats({ cursor: 0, limit: 25 });

    return (
        <>
        <InfiniteListLoader 
            initialData={chats}
            loadMore={getChats}
            limit={5}
            component={ChatCardSmall}
            componentProps={{hasLink: true}}
        />
        </>
    )
}