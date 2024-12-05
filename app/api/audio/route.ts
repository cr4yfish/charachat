"use server";

import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { decryptMessage } from "@/lib/crypto";
import Replicate from "replicate";

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

        const replicate = new Replicate({
            auth: replicateToken
        });
        const result = await replicate.run(
            "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e", 
            { 
                input: {
                    text: prompt,
                    speaker: speakerLink,
                    language: "en"
                } 
            }
        );
        const link = result as unknown as string;

        return new Response(JSON.stringify({ link: link }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}