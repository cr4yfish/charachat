import { generateImage } from "@/functions/ai/image";
import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { ImageModelId } from "@/lib/ai";
import { decryptMessage } from "@/lib/crypto";

type RequestBody = {
    contextFields?: string[],
    imagePrompt: string,
    model?: ImageModelId,
    provider?: "hf" | "replicate";
}

export async function POST(req: Request) {
    const { contextFields, imagePrompt, model, provider } = (await req.json()) as RequestBody;
    try {
        const profile = await getCurrentUser();

        const key = await getKeyServerSide();
        const keyBuffer = Buffer.from(key, "hex");
        let hfToken: string | undefined, replicateToken: string | undefined;

        if(profile.hf_encrypted_api_key) {
            hfToken = decryptMessage(profile.hf_encrypted_api_key, keyBuffer);
        } 

        if(profile.replicate_encrypted_api_key) {
            replicateToken = decryptMessage(profile.replicate_encrypted_api_key, keyBuffer);
        } 

        let input = "";

        contextFields?.forEach((field) => {
            if(field && field.length > 0) {
              input += field.slice(0, 100) + " ";  
            }
        });

        const link = await generateImage({
            hfToken, replicateToken,
            inputs: imagePrompt ?? input,
            model: model,
            provider: provider
        })

        return new Response(JSON.stringify({ link: link }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}