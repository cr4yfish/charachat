import { deleteMessage } from "@/lib/db/messages";


export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    const chatId = searchParams.get("chatId");

    if (!messageId) {
        return new Response("Message ID is required", { status: 400 });
    }

    if (!chatId) {
        return new Response("Chat ID is required", { status: 400 });
    }

    try {
        // Assuming deleteMessage is a function that handles the deletion logic
        await deleteMessage(messageId, chatId);
        return new Response("Message deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting message:", error);
        return new Response("Failed to delete message", { status: 500 });
    }
}