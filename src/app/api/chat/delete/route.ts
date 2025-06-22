import { deleteChat } from "@/lib/db/chat";


export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
        return new Response("Chat ID is required", { status: 400 });
    }

    try {
        // Assuming you have a function to delete a chat by ID
        await deleteChat(chatId);
        return new Response("Chat deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return new Response("Failed to delete chat", { status: 500 });
    }
} 