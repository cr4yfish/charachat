import { getChats } from "@/lib/db/chat";
import { LIMITS } from "@/lib/limits";


export async function GET(request: Request) {
    const url = new URL(request.url);
    const cursor = parseInt(url.searchParams.get("cursor") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || LIMITS.MAX_CHATS_PER_PAGE.toString(), 10);

    const chats = await getChats({
        cursor,
        limit,
    });

    return Response.json(chats);
}