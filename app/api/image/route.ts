
import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { ImageModelId } from "@/lib/ai";
import { decryptMessage } from "@/lib/crypto";
import { Character, Story } from "@/types/db";
import { HfInference } from "@huggingface/inference";
import { ImgurClient } from "imgur"

type RequestBody = {
    character?: Character | undefined;
    story?: Story | undefined;
}

export async function POST(req: Request) {
    const { character, story } = (await req.json()) as RequestBody;

    const profile = await getCurrentUser();

    let hfToken: string | undefined;

    if(profile.hf_encrypted_api_key) {
        // decrypt the api key
        const key = await getKeyServerSide();
        hfToken = decryptMessage(profile.hf_encrypted_api_key, Buffer.from(key, "hex"));
    }

    const hf = new HfInference(hfToken || process.env.HF_API_KEY);

    const model: ImageModelId = "black-forest-labs/FLUX.1-schnell";

    const title = character?.name || story?.title;
    const description = character?.description || story?.description;

    if(!title || !description) {
        return new Response("Missing title or description", { status: 400 });
    }

    const blob = await hf.textToImage({
        model: model,
        inputs: `${title.slice(0, 100)} ${description.slice(0, 100)}`,
        parameters: {
            height: 512,
            width: 512,
        }
    }).catch((e) => {
        console.error(e);
        return undefined;
    })

    if(!blob) {
        return new Response("Error", { status: 500 });
    }

    const base64 = await blob.arrayBuffer().then((buffer) => Buffer.from(buffer).toString("base64"));

    const imgur = new ImgurClient({ 
        clientId: process.env.IMGUR_CLIENT_ID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET
    });

    const imgurResponse = await imgur.upload({
        image: base64,
        type: "base64"
    }).catch((e) => {
        console.error(e);
        return new Response("Error", { status: 500 });
    });

    if ('data' in imgurResponse) {
        return new Response(JSON.stringify({ link: imgurResponse.data.link }), { status: 200 });
    } else {
        return new Response("Error", { status: 500 });
    }
}