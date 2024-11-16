"use server";

import ChatMain from "@/components/chat/ChatMain";
import ChatSettingsDrawer from "@/components/chat/ChatSettingsDrawer";
import BackLink from "@/components/utils/BackLink";

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
        initMessages = initMessages.reverse();
    } catch (error) {
        console.error(error);
    }

    const profile = await getCurrentUser();

    if(!profile.user) {
        return <p>Not logged in</p>
    }

    return (
        <>
        <div className="absolute top-0 left-0 z-50 p-6 bg-content1/50 backdrop-blur-xl rounded-b-xl w-full flex flex-row items-center justify-evenly">
            <BackLink />
            <span className="text-medium w-full text-center font-bold">{chat.character.name}</span>
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