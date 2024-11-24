import { generateImage, uploadImageToImgur } from "@/functions/ai/image";
import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { decryptMessage } from "@/lib/crypto";
import { Character, ChatContext, Story } from "@/types/db";

type RequestBody = {
    character?: Character | undefined;
    story?: Story | undefined;
    chatContext?: ChatContext | undefined;
}

export async function POST(req: Request) {
    const { character, story, chatContext } = (await req.json()) as RequestBody;

    try {
        const profile = await getCurrentUser();

        let hfToken: string | undefined;

        if(profile.hf_encrypted_api_key) {
            // decrypt the api key
            const key = await getKeyServerSide();
            hfToken = decryptMessage(profile.hf_encrypted_api_key, Buffer.from(key, "hex"));
        }

        const title = character?.name || story?.title;
        const description = character?.description || story?.description;

        if(!title || !description || !chatContext?.summary) {
            throw new Error("Missing required fields");
        }

        const image = await generateImage({
            hfToken,
            inputs: `${title} ${description}`,
        })

        const link = await uploadImageToImgur(image);

        return new Response(JSON.stringify({ link: link }), { status: 200 });
        
    } catch (e) {
        const err = e as Error;
        return new Response(err.message, { status: 500 });
    }
}