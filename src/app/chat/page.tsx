import { Chat } from "@/components/chat/chat";
import { ChatTopBar } from "@/components/ui/top-bar/chat-top-bar";
import { v4 as uuidv4 } from "uuid";
import { getShallowCharacter } from "@/lib/db/character";
import { Character } from "@/lib/db/types/character";
export default async function NewChatPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

    // Extract characterId from searchParams and try to get the shallow character
    // If characterId is not present, shallowCharacter will be undefined
    // and the chat will be created without a character context.
    const resolvedSearchParams = await searchParams;
    const characterId: string | undefined = resolvedSearchParams.characterid as string | undefined;
    const shallowCharacter: Character | undefined = characterId ?  await getShallowCharacter(characterId) : undefined;    
    

    const chatId = uuidv4();

    return (
        <>
        <ChatTopBar shallowCharacter={shallowCharacter} chatId={chatId} />
        <Chat shallowCharacter={shallowCharacter} chatId={chatId} initialMessages={[]} />
        </>
    )
}