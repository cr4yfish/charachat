import { getLatestChat } from "@/lib/db/chat";


export async function GET() {

    const res = await getLatestChat();
    if (!res) { 
        return new Response(JSON.stringify({ error: "No chat found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    

    return Response.json(res);
}