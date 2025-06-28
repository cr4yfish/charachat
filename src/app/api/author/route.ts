import { getModelApiKey } from "@/lib/ai";
import { Author } from "@/lib/ai/author";
import { TextModelId } from "../../../lib/ai/models/llm";
import { getProfile } from "@/lib/db/profile";
import { currentUser } from "@clerk/nextjs/server";


export async function POST(request: Request) {
    // Prompt is not optional
    // If input is provided, author will iterate over it
    const { prompt } = await request.json();

    if(!prompt) {
        return new Response(JSON.stringify({ error: "Prompt and input are required." }), { status: 400 });
    }

    const user = await currentUser();
    if(!user?.id) {
        return new Response(JSON.stringify({ error: "User not authenticated." }), { status: 401 });
    }

    const profile = await getProfile(user.id)

    if(!profile) {
        return new Response(JSON.stringify({ error: "Profile not found." }), { status: 404 });
    }

    if(!profile.default_llm) {
        return new Response(JSON.stringify({ error: "Default LLM not set in profile." }), { status: 400 });
    }

    const apiKey = await getModelApiKey(profile, profile.default_llm as TextModelId);

    const result = await Author({
        prompt, 
        modelId: profile.default_llm as TextModelId,
        apiKey
    })



    return Response.json({
        result: result || "",
    })

}