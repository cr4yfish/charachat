"use server";

import { generateAudio } from "@/functions/ai/audio";
import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { decryptMessage } from "@/lib/crypto";

type RequestBody = {
    prompt: string;
    speakerLink: string;
}

export async function POST(req: Request) {
    const { prompt, speakerLink } = (await req.json()) as RequestBody;

    try {
        const profile = await getCurrentUser();

        const key = await getKeyServerSide();
        const keyBuffer = Buffer.from(key, "hex");
        let replicateToken: string | undefined;


        if(profile.replicate_encrypted_api_key) {
            replicateToken = decryptMessage(profile.replicate_encrypted_api_key, keyBuffer);
        } 

        if(!replicateToken) {
            return new Response("No API keys found", { status: 400 });
        }

        const link = await generateAudio({
            replicateToken,
            text: prompt,
            speaker: speakerLink,
            language: "en"
        })

        return new Response(JSON.stringify({ link: link }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}