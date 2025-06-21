// Create character API route

import { createCharacter } from "@/lib/db/character";

export async function POST(request: Request) {
    try {
        const newChar = await request.json();
       
        const res = await createCharacter(newChar);

        if (!res) {
            throw new Error('Character creation failed');
        }

        return Response.json(res);

    } catch (error) {
        console.error('Error in createCharacter:', error);
        return new Response(JSON.stringify({ error: 'Character creation failed' }), { status: 500 });
    }

}