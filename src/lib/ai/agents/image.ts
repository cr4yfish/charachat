import { uploadImageToImgur } from "@/lib/imgur";
import { createReplicate } from "@ai-sdk/replicate";
import { experimental_generateImage } from "ai";
import sharp from 'sharp';

type Params = {
    imagePrompt: string;
    model?: string; // ImageModelId
    context?: {
        chatId?: string;
        characterId?: string;
        personaId?: string;
        messageIds?: string[];
    }
}

/**
 * Generates an image based on the provided prompt using the Replicate API and uploads it to Imgur.
 * @param param0 - imagePrompt: The prompt for the image generation.
 * @param param0.model - Optional model identifier in the format "modelName:modelVersion".
 * This function generates an image based on the provided prompt using the Replicate API, converts it to JPEG format, and uploads it to Imgur.
 * It returns the Imgur URL of the uploaded image.
 * @returns 
 */
export async function generateImageAgent({ imagePrompt, model }: Params) {
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

    const { image } = await experimental_generateImage({
        model: replicate.image('black-forest-labs/flux-schnell'),
        prompt: imagePrompt,
        providerOptions: {
            replicate: options
        }
    });

    if (!image) {
        throw new Error("No image generated");
    }

    // Convert webp image to jpeg before uploading to Imgur
    const jpegBuffer = await sharp(image.uint8Array)
        .jpeg({ quality: 90 })
        .toBuffer();
    const base64Image = jpegBuffer.toString('base64');
    const imgurUrl = await uploadImageToImgur(base64Image);

    if (!imgurUrl) {
        throw new Error("Failed to upload image to Imgur");
    }

    return imgurUrl;
}