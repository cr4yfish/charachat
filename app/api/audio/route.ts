import { authorNoStream } from "@/functions/ai/author";
import { getCurrentUser } from "@/functions/db/auth";
import { NextResponse } from "next/server";
import Replicate from "replicate";



export async function POST(request: Request) {
    const { prompt, replicateToken, speakerLink } = await request.json();
    
    const profile = await getCurrentUser();

    // rewrite prompt to be a dialogue text
    const authorResult = await authorNoStream({
        profile,
        systemText: `
            You rewrite the prompt to be pure dialogue, easily readable, text. 
            Rewrite everything between "_" (actions) to first-person perspective narrations (Example: *moves hand* to "I move my hand"). 
            Respond in readable letters only, removing all Markdown formatting! Encapsulate dialog with quotation marks (")!
            Only return the dialogue text in your response.
        `,
        prompt: prompt
    })  

    const newPrompt = authorResult.text.replaceAll("*", "").replaceAll(/\.(\.+)/g, '.');

    const replicate = new Replicate({
        auth: replicateToken
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        model: "lucataco/xtts-v2",
        version: '684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e',
        input: { 
            text: newPrompt, 
            speaker: speakerLink,
            language: "en" 
        },
    }
    
    // A prediction is the result you get when you run a model, including the input, output, and other details
    const prediction = await replicate.predictions.create(options);
    
    if (prediction?.error) {
        return NextResponse.json({ detail: prediction.error }, { status: 500 });
    }
    
    return NextResponse.json(prediction, { status: 201 });
}