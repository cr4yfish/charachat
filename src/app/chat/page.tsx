import { cookies } from "next/headers";
import { Chat } from "@/components/chat/chat";
import { ChatTopBar } from "@/components/ui/top-bar/chat-top-bar";
import { v4 as uuidv4 } from "uuid";
import { getShallowCharacter } from "@/lib/db/character";
import { Character } from "@/lib/db/types/character";
import { COOKIE_NAMES } from "@/lib/constants/cookieNames";
import { ModelId } from "@/lib/ai/types";
import { getLLMById } from "@/lib/ai/utils";

export default async function NewChatPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const cookieStore = await cookies();

    // Extract characterId from searchParams and try to get the shallow character
    // If characterId is not present, shallowCharacter will be undefined
    // and the chat will be created without a character context.
    const resolvedSearchParams = await searchParams;
    const characterId: string | undefined = resolvedSearchParams.characterid as string | undefined;
    const shallowCharacter: Character | undefined = characterId ?  await getShallowCharacter(characterId) : undefined;    
    
    const modelCookie = cookieStore.get(COOKIE_NAMES.CURRENT_MODEL)?.value;
    const defaultLLM = modelCookie ? getLLMById(modelCookie as ModelId) : undefined;

    const chatId = uuidv4();

    return (
        <>
        <ChatTopBar shallowCharacter={shallowCharacter} chatId={chatId} />
        <Chat shallowCharacter={shallowCharacter} chatId={chatId} initialMessages={[]} defaultLLM={defaultLLM} />
        </>
    )
}