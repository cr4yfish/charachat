import { ImageModelId } from "@/lib/ai/types";
import { NextResponse } from "next/server";
import { generateImageAgent } from "@/lib/ai/agents/image";

type RequestBody = {
    imagePrompt: string,
    model?: ImageModelId,
}

export async function POST(request: Request) {
    const { imagePrompt, model } = (await request.json()) as RequestBody;
    
    try {
        const imageUrl = await generateImageAgent({
            imagePrompt, model
        })

        return NextResponse.json({
            imageUrl: imageUrl,
            imagePrompt: imagePrompt,
            model: model,
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({
            error: "Failed to generate image",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}