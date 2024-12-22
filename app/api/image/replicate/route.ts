import { getCurrentUser } from "@/functions/db/auth";
import { getKeyServerSide } from "@/functions/serverHelpers";
import { ImageModelId } from "@/lib/ai";
import { decryptMessage } from "@/lib/crypto";
import { Lora } from "@/types/db";
import { NextResponse } from "next/server";
import Replicate from "replicate";

type RequestBody = {
    imagePrompt: string,
    model?: ImageModelId,
    loras?: Lora[]
}

export async function POST(request: Request) {
    const { imagePrompt, model, loras } = (await request.json()) as RequestBody;
    
    const profile = await getCurrentUser();
    const encryptedToken = profile.replicate_encrypted_api_key;
    if(!encryptedToken) {
        return NextResponse.json({ detail: "No Replicate API key found" }, { status: 400 });
    }

    const key = await getKeyServerSide();
    const keyBuffer = Buffer.from(key, "hex");
    const replicateToken = decryptMessage(encryptedToken, keyBuffer);

    const replicate = new Replicate({
        auth: replicateToken
    });

    const modelName = model?.split(":")[0] ?? "black-forest-labs/flux-schnell";
    const modelVersion = model?.split(":")[1];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        model: modelName,
        version: modelVersion,
        input: { 
            prompt: "score_9, score_8_up, score_7_up" + loras?.map(l => l.activation).join(",") + "," + imagePrompt,
            negative_prompt: "score_6, score_5, score_4, score_3, score_2, score_1, ugly, low res, blurry, bad quality, bad anatomy, worst quality, low quality, low resolutions, extra fingers, blur, blurry, ugly, wrongs proportions, watermark, image artifacts, lowres, ugly, jpeg artifacts, deformed, noisy image",
            disable_safety_checker: true,
            safety_tolerance: 6,
            apply_watermark: false,
            output_format: "jpg",
            go_fast: true,
            aspect_ratio: "4:3",
            extra_lora: loras?.map(lora => lora.url).join(","),
        },
    }
    
    // A prediction is the result you get when you run a model, including the input, output, and other details
    const prediction = await replicate.predictions.create(options);
    
    if (prediction?.error) {
        return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }
    
    return NextResponse.json(prediction, { status: 201 });
}