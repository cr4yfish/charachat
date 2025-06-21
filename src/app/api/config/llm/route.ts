import { getLLMModelCookie, setLLMModelCookie } from "@/app/actions";


export async function GET() {
    
    const res = await getLLMModelCookie();
    if (!res) {
        return Response.json({ error: "LLM model cookie not found" }, { status: 404 });
    }

    return Response.json({ llm: res });
}


export async function POST(request: Request) {
    const body = await request.json();
    const model = body.model;

    if (!model) {
        return Response.json({ error: "Model is required" }, { status: 400 });
    }

    try {
        await setLLMModelCookie(model);
        return Response.json({ message: "LLM model cookie set successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error setting LLM model cookie:", error);
        return Response.json({ error: "Failed to set LLM model cookie" }, { status: 500 });
    }
}