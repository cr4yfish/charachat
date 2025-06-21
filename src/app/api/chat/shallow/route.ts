import { getShallowChat } from "@/lib/db/chat";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");

    if (!chatId) {
        console.error("Chat ID is required but not provided.");
        return new Response("Chat ID is required", { status: 400 });
    }

    const chats = await getShallowChat(chatId);

    return Response.json(chats);
}