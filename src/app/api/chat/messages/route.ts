import { getKeyServerSide } from "@/lib/crypto/server";
import { getMessages } from "@/lib/db/messages";
import { LIMITS } from "@/lib/constants/limits";
import { convertToUIMessages } from "@/lib/utils/message";



export async function GET(request: Request) {
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");
    const from = url.searchParams.get("from") || "0";
    const limit = url.searchParams.get("limit") || LIMITS.MAX_MESSAGES_PER_PAGE.toString();

    if (!chatId) {
        return new Response("Chat ID is required", { status: 400 });
    }

    try {
        const key = await getKeyServerSide();
        const messages = await getMessages({
            chatId,
            from: parseInt(from, 10),
            limit: parseInt(limit, 10),
            key: key,
        });
        return Response.json(convertToUIMessages(messages));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return new Response("Failed to fetch messages", { status: 500 });
    }
}