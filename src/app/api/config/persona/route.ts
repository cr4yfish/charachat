import { getPersonaCookie, setPersonaCookie } from "@/app/actions";
import { getLLMById } from "@/lib/ai/utils";
import { TextModelId } from "@/lib/ai/models/llm";


export async function GET() {
    
    const res = await getPersonaCookie();
    if (!res) {
        return Response.json({ error: "Persona cookie not found" }, { status: 404 });
    }

    const llm = getLLMById(res as TextModelId);

    return Response.json({ llm: llm });
}


export async function POST(request: Request) {
    const body = await request.json();
    const persona = body.personaId;

    if (!persona) {
        return Response.json({ error: "PersonaId is required" }, { status: 400 });
    }

    try {
        await setPersonaCookie(persona);
        return Response.json({ message: "Persona cookie set successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error setting Persona cookie:", error);
        return Response.json({ error: "Failed to set Persona cookie" }, { status: 500 });
    }
}