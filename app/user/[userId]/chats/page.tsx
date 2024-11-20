"use server";

import ChatCardSmall from "@/components/chat/ChatCardSmall";
import InfiniteListLoader from "@/components/InfiniteListLoader";
import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";
import { getChats } from "@/functions/db/chat";

export default async function UserChats({ params: {  } } : { params: { userId: string } }) {

    const chats = await getChats(0, 15);

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 w-full h-full pb-20">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Your chats</h1>
                </div>
                
                <Button isIconOnly variant="light" color="warning"><Icon>add</Icon></Button>
            </div>

            <InfiniteListLoader 
                initialData={chats}
                loadMore={getChats}
                limit={5}
                component={ChatCardSmall}
                componentProps={{ hasLink: true }}
            />
      
        </div>
        </>
    )
}