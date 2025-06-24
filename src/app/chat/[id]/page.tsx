import { Chat } from "@/components/chat/chat";
import { ChatTopBar } from "@/components/ui/top-bar/chat-top-bar";
import { getMessages } from "@/lib/db/messages";
import { getKeyServerSide } from "@/lib/crypto/server";
import { convertToUIMessages } from "@/lib/utils/message";
import { getShallowChat } from "@/lib/db/chat";
import { ShallowCharacter } from "@/types/db";
import { LIMITS } from "@/lib/constants/limits";

export default async function ExistingChatPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const key = await getKeyServerSide();

    const initialMessages = await getMessages({
        chatId: id,
        from: 0,
        limit: LIMITS.MAX_MESSAGES_PER_PAGE,
        key: key
    })

    const uiMessages = convertToUIMessages(initialMessages);

    const chat = await getShallowChat(id);

    if (!chat) {
        return <div>Chat not found</div>;
    }

    const shallowCharacter = {
        id: chat.character.id,
        name: chat.character.name,
        image_link: chat.character.image_link,
    } as ShallowCharacter;

    return (
        <>
        <ChatTopBar chatId={id} shallowCharacter={shallowCharacter} />
        <Chat shallowCharacter={shallowCharacter} chatId={id} initialMessages={uiMessages} />
        </>
    )
}