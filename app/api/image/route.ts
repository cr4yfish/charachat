import { generateImage } from "@/functions/ai/image";
import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { decryptMessage } from "@/lib/crypto";
import { Character, Persona, Story } from "@/types/db";

type RequestBody = {
    character?: Character | undefined;
    story?: Story | undefined;
    persona?: Persona | undefined;
}

export async function POST(req: Request) {
    const { character, story, persona } = (await req.json()) as RequestBody;

    try {
        const profile = await getCurrentUser();

        let hfToken: string | undefined, replicateToken: string | undefined;

        if(profile.hf_encrypted_api_key) {
            // decrypt the api key
            const key = await getKeyServerSide();
            hfToken = decryptMessage(profile.hf_encrypted_api_key, Buffer.from(key, "hex"));
        } else if(profile.replicate_encrypted_api_key) {
            const key = await getKeyServerSide();
            replicateToken = decryptMessage(profile.replicate_encrypted_api_key, Buffer.from(key, "hex"));
        }

        const title = character?.name || story?.title || persona?.full_name || profile?.username;
        const description = character?.description || story?.description || persona?.bio || profile.bio;

        if(!title || !description) {
            throw new Error("Missing required fields");
        }

        const link = await generateImage({
            hfToken, replicateToken,
            inputs: `${title} ${description}`,
        })

        return new Response(JSON.stringify({ link: link }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}