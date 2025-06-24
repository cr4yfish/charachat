import { getLatestChat } from "@/lib/db/chat";
import { currentUser } from "@clerk/nextjs/server";


export async function GET() {

    const user = await currentUser();

    if(!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    const res = await getLatestChat();
    if (!res) { 
        return new Response(JSON.stringify({ error: "No chat found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        });
    }

    

    return Response.json(res);
}