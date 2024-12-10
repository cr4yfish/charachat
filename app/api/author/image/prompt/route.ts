
import { Profile } from "@/types/db";
import { authorNoStream } from "@/functions/ai/author";

type RequestBody = {
    profile: Profile, messageContent: string, characterDescription: string
}

export async function POST(req: Request) {
    const { profile, messageContent, characterDescription } = (await req.json()) as RequestBody;


    // Generate the story field in a Story
    // based on Title and Description
    const result = await authorNoStream({
        profile: profile,
        systemText: `
            You are a helpful and experienced Stable Diffusion Image promp generator. 
            You help users write Image Prompts based on input chat messages.
            Make sure to describe the characters appearance, the setting, the characters emotion and action in the image.
            Your ouput is a stable diffusion prompt to generate an image best describing the input chat message.
            Your responst has to be less than 25 words.
        `,
        prompt: `
            Message: ${messageContent}
            Character Description: ${characterDescription}    
        `
    })

    return new Response(JSON.stringify({ result }), { status: 200 });
}