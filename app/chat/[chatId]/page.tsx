"use server";

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
import { getKeyServerSide } from "@/functions/serverHelpers";

type Params = Promise<{ chatId: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    const { chatId } = await params;
    try {
        const chat = await getChat(chatId);

        return {
            title: `Chat with ${chat.character.name} - Charachat`,
        }
        
    } catch (error) {
        console.error("Error getting metadata:",error);
        return {
            title: `Chat - Charachat`,
        }   
    }

}

export default async function Chat({ params } : { params: Params }) {
    const { chatId } = await params;

    let chat: ChatType | null = null;

    try {
        chat = await getChat(chatId);
    } catch (error) {
        console.error("Error getting chat information with chatId:", chatId, "and error:" ,error);
        chat = null;
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

    const key = await getKeyServerSide();

    if (!key) {
        console.error("No key");
        return (
            <>
            <div className="px-4 py-6 flex flex-col items-center justify-center">
                <div className="flex flex-col prose dark:prose-invert">
                    <h1>Error: Didnt find an Encryption Key in your session data!</h1>
                    <p>Please report this issue. To fix this, please log out and then back in.</p>
                </div>
                <LoginButton showLogout />
            </div>
            
            </>
        )
    }

    try {
        initMessages = await getMessages({
            chatId: chat.id,
            from: 0,
            limit: 30,
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
            <div className="absolute top-0 left-0 z-50 w-full flex items-center justify-between">
                <div className="p-4 bg-zinc-50/75 dark:bg-zinc-900/75 backdrop-blur-lg border-r border-b border-zinc-200 dark:border-zinc-800 rounded-b-xl rounded-l-none max-md:rounded-l-xl w-full flex flex-row items-center justify-between gap-2">
                    
                    <div className="flex items-center gap-2">
                        <SidebarTrigger><></></SidebarTrigger>
                        <Link href={`/c/${chat.character.id}`} className="flex items-center gap-2" >
                            <Avatar size="sm" src={chat?.character.image_link} />
                            <span className="text-medium text-center font-bold">{chat.character.name}</span>
                        </Link>
                    </div>

                   <ChatSettingsDrawer user={profile} />
                    
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