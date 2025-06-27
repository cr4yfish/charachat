import { getPersona } from "@/lib/db/persona";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return Response.json({ error: "No ID provided" }, { status: 400 });
    }

    try {
        const persona = await getPersona(id)
       
        return Response.json(persona);
    } catch (error) {
        return Response.json(error, { status: 500 });
    }
    
}