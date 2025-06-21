import { updateChat } from "@/lib/db/chat";


export async function POST(request: Request) {
    const body = await request.json();
    const { chat } = body;

    if (!chat || !chat.id) {
        return new Response(JSON.stringify({ error: "Chat ID is required" }), { status: 400 });
    }

    await updateChat(chat);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

}