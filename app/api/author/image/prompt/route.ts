
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
            You take a context as input and create a prompt based on that, that will generate an image reflecting the situation.

            Always include the following:
            - Location (Example: Suburban Backyard, white fence)
            - Character clothing, action & emotion (Example: Green T-Shirt, throwing baseball, smiling)
            - Time and weather (Example: Rainy night)
            - The camera (viewers) location and angle (Example: Viewer looking down, far away)

            Your ouput is a stable diffusion prompt to generate an image best describing the input chat message.

            About stable diffusion prompts:
            - A stable diffusion prompt consists of short keywords/sentences (Examples: Scarf, coat, Sunny day, jumping in the air, public park)
            - The order matters, keywords coming first are ranked higher, thus are more important to paint an image
            - Let it have some creativity, only provide hard facts to guide the generation to what the User might want to see
            - Keep it as short and concise as possible as too long prompts will have negative effects 
        `,
        prompt: `
            Message: ${messageContent}
            Character Description: ${characterDescription}    
        `
    })

    return new Response(JSON.stringify({ result }), { status: 200 });
}