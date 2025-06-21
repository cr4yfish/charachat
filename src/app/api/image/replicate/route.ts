import { ImageModelId } from "@/lib/ai/types";
import { NextResponse } from "next/server";
import { createReplicate } from '@ai-sdk/replicate';
import { experimental_generateImage as generateImage } from 'ai';
import { uploadImageToImgur } from "@/lib/imgur";
import sharp from 'sharp';

type RequestBody = {
    imagePrompt: string,
    model?: ImageModelId,
}

export async function POST(request: Request) {
    const { imagePrompt, model } = (await request.json()) as RequestBody;
    
    const replicateToken = process.env.REPLICATE_API_KEY;

    const replicate = createReplicate({
        apiToken: replicateToken
    });

    const modelName = model?.split(":")[0] ?? "black-forest-labs/flux-schnell";
    const modelVersion = model?.split(":")[1];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        model: modelName,
        version: modelVersion,
        input: { 
            prompt: "score_9, score_8_up, score_7_up, " + imagePrompt,
            negative_prompt: "score_6, score_5, score_4, score_3, score_2, score_1, ugly, low res, blurry, bad quality, bad anatomy, worst quality, low quality, low resolutions, extra fingers, blur, blurry, ugly, wrongs proportions, watermark, image artifacts, lowres, ugly, jpeg artifacts, deformed, noisy image",
            disable_safety_checker: true,
            safety_tolerance: 6,
            apply_watermark: false,
            output_format: "jpg",
            go_fast: true,
        },
    }

    const { image } = await generateImage({
        model: replicate.image('black-forest-labs/flux-schnell'),
        prompt: imagePrompt,
        providerOptions: {
            replicate: options
        }
    });

    if (!image) {
        return NextResponse.json({ detail: "No image generated" }, { status: 500 });
    }

    // Convert webp image to jpeg before uploading to Imgur
    const jpegBuffer = await sharp(image.uint8Array)
        .jpeg({ quality: 90 })
        .toBuffer();
    const base64Image = jpegBuffer.toString('base64');
    const imgurUrl = await uploadImageToImgur(base64Image);

    if (!imgurUrl) {
        return NextResponse.json({ detail: "Failed to upload image to Imgur" }, { status: 500 });
    }

    console.log("Image generated and uploaded to Imgur:", imgurUrl);

    return NextResponse.json({
        imageUrl: imgurUrl,
        imagePrompt: imagePrompt,
        model: modelName,
    }, { status: 201 });
}