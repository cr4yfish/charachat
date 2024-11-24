import { ImgurClient } from "imgur"
import { HfInference } from "@huggingface/inference";
import { ImageModelId } from "@/lib/ai";


type GenerateImageProps = {
    hfToken?: string | undefined;
    inputs: string;
}

export async function generateImage(props: GenerateImageProps): Promise<string> {
    const hf = new HfInference(props.hfToken || process.env.HF_API_KEY);
    const model: ImageModelId = "black-forest-labs/FLUX.1-schnell";

    const blob = await hf.textToImage({
        model: model,
        inputs: props.inputs,
        parameters: {
            height: 512,
            width: 512,
        }
    }).catch((e) => {
        throw new Error(e);
    })

    if(!blob) {
        throw new Error("Error generating image");
    }

    return (await blob.arrayBuffer().then((buffer) => Buffer.from(buffer).toString("base64")));
}

export async function uploadImageToImgur(base64: string): Promise<string> {
    const imgur = new ImgurClient({ 
        clientId: process.env.IMGUR_CLIENT_ID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET
    });

    const imgurResponse = await imgur.upload({
        image: base64,
        type: "base64"
    }).catch((e) => {
        throw new Error(e);
    });

    return imgurResponse.data.link
}