"use server";

import ChatMain from "@/components/chat/ChatMain";

import { getCurrentUser } from "@/functions/db/auth";
import { getChat } from "@/functions/db/chat"
import { getMessages } from "@/functions/db/messages";

import { Chat as ChatType, Message } from "@/types/db";


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
    } catch (error) {
        console.error(error);
    }

    const profile = await getCurrentUser();

    if(!profile.user?.id) {
        return <p>Not logged in</p>
    }

    return (
        <>
        <div className=" w-full flex flex-col items-center justify-center">
            <span className="text-medium">{chat.character.name}</span>
            <span className="text-tiny">By {chat.character.owner.username}</span>
        </div>

        <ChatMain
            chat={chat}
            initMessages={initMessages}
            user={profile}
        />
       
        </>
    )
}