import { cookies } from "next/headers";
import { Chat } from "@/components/chat/chat";
import { ChatTopBar } from "@/components/ui/top-bar/chat-top-bar";
import { v4 as uuidv4 } from "uuid";
import { getShallowCharacter } from "@/lib/db/character";

export default async function NewChatPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const cookieStore = await cookies();
    // Extract characterId from searchParams or cookies
    const resolvedSearchParams = await searchParams;
    let characterId: string | undefined = resolvedSearchParams.characterid as string | undefined;

    // If characterId is not in searchParams, check cookies
    if(!characterId) {
        characterId = cookieStore.get("character_id")?.value;
    }

    if(!characterId) {
        return <div>No character selected for the chat.</div>;
    }

    const chatId = uuidv4();

    const shallowCharacter = await getShallowCharacter(characterId);

    return (
        <>

        <ChatTopBar shallowCharacter={shallowCharacter} />
        <Chat shallowCharacter={shallowCharacter} chatId={chatId} initialMessages={[]} />

        </>
    )
}