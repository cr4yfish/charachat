import { cookies } from "next/headers";
import { Chat } from "@/components/chat/chat";
import { ChatTopBar } from "@/components/ui/top-bar/chat-top-bar";
import { v4 as uuidv4 } from "uuid";
import { getShallowCharacter } from "@/lib/db/character";
import { currentUser } from "@clerk/nextjs/server";
import { Character } from "@/types/db";
import { COOKIE_NAMES } from "@/lib/cookieNames";
import { ModelId } from "@/lib/ai/types";
import { getLLMById } from "@/lib/ai/utils";
import { ChatSettingsProvider } from "@/hooks/use-chat-settings";

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
        /**
         * Deprecated: Use `characterId` from searchParams instead.
         * This will be removed in future versions.
         * @deprecated
         */
        characterId = cookieStore.get(COOKIE_NAMES.CURRENT_CHARACTER)?.value;
    }
    const modelCookie = cookieStore.get(COOKIE_NAMES.CURRENT_MODEL)?.value;
    const defaultLLM = modelCookie ? getLLMById(modelCookie as ModelId) : undefined;

    const chatId = uuidv4();

    const shallowCharacter: Character | undefined = characterId ?  await getShallowCharacter(characterId) : undefined;

    const user = await currentUser();
    const isLoggedIn = !!user?.id;

    return (
        <>

        <ChatSettingsProvider>
            <ChatTopBar shallowCharacter={shallowCharacter} chatId={chatId} isLoggedIn={isLoggedIn} />
            <Chat shallowCharacter={shallowCharacter} chatId={chatId} initialMessages={[]} defaultLLM={defaultLLM} />
        </ChatSettingsProvider>
        </>
    )
}