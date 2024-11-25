import { ImgurClient } from "imgur"
import Replicate from "replicate";
import { HfInference } from "@huggingface/inference";
import { ImageModelId } from "@/lib/ai";


type GenerateImageProps = {
    hfToken?: string | undefined;
    replicateToken?: string | undefined;
    inputs: string;
    prefix?: string;
}

type ReplicateOutput = string[];

export async function generateImage(props: GenerateImageProps): Promise<string> {
    if(props.replicateToken) {
        const replicate = new Replicate({
            auth: props.replicateToken
        });
        const output = await replicate.run(
            "black-forest-labs/flux-schnell", 
            { 
                input: {
                    prompt: props.prefix + props.inputs, 
                    disable_safety_checker: true,
                    output_format: "jpg",
                    go_fast: true,
                    aspect_ratio: "4:5"
                } 
            }
        );

        const repOutput: ReplicateOutput = output as ReplicateOutput;

        return repOutput[0];
    }

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

    const base64 =  (await blob.arrayBuffer().then((buffer) => Buffer.from(buffer).toString("base64")));

    const link = await uploadImageToImgur(base64);

    return link;

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