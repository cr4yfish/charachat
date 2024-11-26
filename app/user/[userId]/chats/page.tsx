"use server";

import ChatCard from "@/components/chat/ChatCard";
import InfiniteListLoader from "@/components/InfiniteListLoader";
import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";
import { getChats } from "@/functions/db/chat";

export default async function UserChats({ params: {  } } : { params: { userId: string } }) {

    const chats = await getChats({ cursor: 0, limit: 5 });

    return (
        <>
        <div className="flex flex-col items-center gap-4 px-4 py-6 w-full h-full pb-20">
            <div className="w-full max-w-xl flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Your chats</h1>
                </div>
                
                <Button isIconOnly variant="light" color="warning"><Icon>add</Icon></Button>
            </div>

            <div className="w-full max-w-xl h-full relative pb-20">
                <InfiniteListLoader 
                    initialData={chats}
                    loadMore={getChats}
                    limit={5}
                    component={ChatCard}
                    componentProps={{ hasLink: true }}
                />
            </div>
      
        </div>
        </>
    )
}