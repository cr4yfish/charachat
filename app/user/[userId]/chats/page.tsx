"use server";

import ChatCardSmall from "@/components/chat/ChatCardSmall";
import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";
import { getChats } from "@/functions/db/chat";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

export default async function UserChats({ params: {  } } : { params: { userId: string } }) {

    const chats = await getChats();

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 w-full h-full pb-20">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Your chats</h1>
                </div>
                
                <Button isIconOnly variant="light" color="warning"><Icon>add</Icon></Button>
            </div>
            
            <ScrollShadow className="max-h-full overflow-y-auto relative pb-20">
                <div className="flex flex-col gap-2 h-fit relative">
                    {chats.map((chat) => (
                        <ChatCardSmall hasLink key={chat.id} chat={chat} />
                    ))}
                </div>
            </ScrollShadow>
        </div>
        </>
    )
}