"use server";

import ChatCardSmall from "@/components/chat/ChatCardSmall";
import BackLink from "@/components/utils/BackLink";
import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";
import { getChats } from "@/functions/db/chat";
import Link from "next/link";

export default async function UserChats({ params: { userId } } : { params: { userId: string } }) {

    const chats = await getChats();

    return (
        <>
        <div className="font-[family-name:var(--font-geist-sans)] flex flex-col gap-4 px-4 py-6">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <BackLink />
                    <h1 className="text-4xl font-bold">Your chats</h1>
                </div>
                
                <Button isIconOnly variant="light" color="warning"><Icon>add</Icon></Button>
            </div>
            

            <div className="flex flex-col gap-2">
                {chats.map((chat) => (
                    <ChatCardSmall key={chat.id} chat={chat} />
                ))}
            </div>
        </div>
        </>
    )
}