"use server";

import { cookies } from "next/headers";
import ChatMain from "@/components/chat/ChatMain";
import ChatSettingsDrawer from "@/components/chat/ChatSettingsDrawer";

import { getCurrentUser } from "@/functions/db/auth";
import { getChat } from "@/functions/db/chat"
import { getMessages } from "@/functions/db/messages";

import { Chat as ChatType, Message, Profile } from "@/types/db";
import { redirect } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";
import Link from "next/link";
import { Button } from "@/components/utils/Button";
import { SharedChatProvider } from "@/context/SharedChatSettings";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Metadata } from "next";

export async function generateMetadata(
    { params: { chatId } } : { params: { chatId: string } }
) : Promise<Metadata> {
    
    try {
        const chat = await getChat(chatId);

        return {
            title: `Chat with ${chat.character.name} - Charachat`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Chat - Charachat`,
        }   
    }

}

export default async function Chat({ params: { chatId } } : { params: { chatId: string } }) {
    const cookieStore = cookies();

    let chat: ChatType | null = null;

    try {
        chat = await getChat(chatId);
    } catch (error) {
        console.error(error);
    }

    if (!chat) {
        return (
        <div className="px-4 py-6 flex flex-col items-center justify-between h-full overflow-y-auto">
            <div className="flex flex-col prose dark:prose-invert prose-h2:mt-3 prose-h2:mb-2">
                <h1>Error: Didnt find a Chat with this id!</h1>
                <div className="flex flex-col m-0 mb-2">
                    <span className="m-0">The chat id</span>
                    <pre className="m-0 select-all">{chatId}</pre>
                </div>
                
                <h2>This could have a few causes:</h2>
                <ul>
                    <li>The chat was deleted</li>
                    <li>The chat belongs to another account</li>
                    <li>You are not logged in</li>
                </ul>
                <h2>To fix this</h2>
                <ul>
                    <li>Try logging out and then back in</li>
                    <li>Check if you are logged in with the correct account</li>
                    <li>Report this issue</li>
                </ul>
            </div>
            <Link href={"/"} className="w-full"><Button fullWidth size="lg" color="primary">Home</Button></Link>
        </div>
        )
    }

    let initMessages: Message[] = [];

    const keyCookie = cookieStore.get("key");
    const key = keyCookie?.value;

    if (!key) {
        console.error("No key cookie");
        return (
            <>
            <div className="px-4 py-6 flex flex-col items-center justify-center">
                <div className="flex flex-col prose dark:prose-invert">
                    <h1>Error: Didnt find an Encryption Key in your session data!</h1>
                    <p>Please report this issue. To fix this, please log out and then back in.</p>
                </div>
                <LoginButton showLogout isLoggedIn={true} />
            </div>
            
            </>
        )
    }

    try {
        initMessages = await getMessages({
            chatId: chat.id,
            from: 0,
            limit: 10,
            key: key
        })
        initMessages = initMessages.reverse();
    } catch (error) {
        console.error(error);
    }

    let profile: Profile | undefined = undefined;
    
    try {
        profile = await getCurrentUser();
    } catch (e) {
        console.error(e);
        redirect("/");
    }

    return (
        <>
        <SharedChatProvider>
            <div className="absolute top-0 left-0 z-50 w-full flex items-center justify-center">
                <div className="p-6 bg-content2/50 backdrop-blur-xl rounded-b-xl w-full flex flex-row items-center justify-evenly max-w-lg">
                    <SidebarTrigger><></></SidebarTrigger>
                    <span className="text-medium w-full text-center font-bold">{chat.character.name}</span>
                    <ChatSettingsDrawer />
                </div>
            </div>

            <ChatMain
                chat={chat}
                initMessages={initMessages}
                user={profile}
            />
        </SharedChatProvider>
       
        </>
    )
}