import { NextResponse } from "next/server";
import Replicate from "replicate";



export async function POST(request: Request) {
    const { prompt, replicateToken, speakerLink } = await request.json();
    
    const replicate = new Replicate({
        auth: replicateToken
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        model: "lucataco/xtts-v2",
        version: '684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e',
        input: { 
            text: prompt, 
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