"use server";

import ChatMain from "@/components/chat/ChatMain";
import ChatSettingsDrawer from "@/components/chat/ChatSettingsDrawer";
import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";

import { getCurrentUser } from "@/functions/db/auth";
import { getChat } from "@/functions/db/chat"
import { getMessages } from "@/functions/db/messages";

import { Chat as ChatType, Message } from "@/types/db";
import Link from "next/link";


export default async function Chat({ params: { chatId } } : { params: { chatId: string } }) {

    let chat: ChatType | null = null;

    try {
        chat = await getChat(chatId);
    } catch (error) {
        console.error(error);
    }

    if (!chat) {
        return <p>Chat not found</p>
    }

    let initMessages: Message[] = [];

    try {
        initMessages = await getMessages({
            chatId: chat.id,
            from: 0,
            limit: 10
        })
        initMessages = initMessages.reverse();
    } catch (error) {
        console.error(error);
    }

    const profile = await getCurrentUser();

    if(!profile.user?.id) {
        return <p>Not logged in</p>
    }

    return (
        <>
        <div className="absolute top-0 left-0 z-50 p-6 bg-content1/50 backdrop-blur-xl rounded-b-xl w-full flex flex-row items-center justify-evenly">
            <Link href={`/c/${chat.character.id}`}>
                <Button isIconOnly variant="light" color="primary" className="justify-start">
                    <Icon>arrow_back</Icon>
                </Button>
            </Link>
            <span className="text-medium w-full text-center">{chat.character.name}</span>
            <ChatSettingsDrawer chat={chat} />
        </div>

        <ChatMain
            chat={chat}
            initMessages={initMessages}
            user={profile}
        />
       
        </>
    )
}