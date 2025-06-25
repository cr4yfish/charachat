import { updateCharacter } from "@/lib/db/character";


export async function POST(request:Request) {
    const char = await request.json();
    
    const res = await updateCharacter(char);
    if (!res) {
        return Response.json({ error: "Character not found or update failed" }, { status: 404 });
    }

    return Response.json(res);
}