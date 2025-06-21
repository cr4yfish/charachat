import { getKeyServerSide } from "@/lib/crypto/server";
import { addMessage } from "@/lib/db/messages";
import { Chat, Message } from "@/types/db";
import { currentUser } from "@clerk/nextjs/server";


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, chatId } = body;

        if (!message || !chatId) {
            return new Response(JSON.stringify({ error: "Message and chatId are required" }), { status: 400 });
        }

        const user = await currentUser();
        if (!user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const msgToSave: Message = {
            id: message.id,
            content: JSON.stringify(message.parts),
            chat: {
                id: chatId,
            } as Chat,
            clerk_user_id: user.id,
            created_at: message.createdAt || new Date().toISOString(),
            from_ai: true
        }

        console.log("Saving message:", msgToSave);

        const key = await getKeyServerSide();

        await addMessage(msgToSave, key)

        return new Response(JSON.stringify({ success: true, message: "Message added successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error adding message:", error);
        return new Response(JSON.stringify({ error: "Failed to add message" }), { status: 500 });
    }
}