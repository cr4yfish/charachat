
import { Character, Profile } from "@/types/db";
import { author } from "@/functions/ai/author";

type RequestBody = {
    character: Character, profile: Profile, apikey: string, messages: string[] 
}

export async function POST(req: Request) {
    const { character, profile } = (await req.json()) as RequestBody;

    // Generate the story field in a Story
    // based on Title and Description
    const result = await author({
        profile: profile,
        systemText: `
            You are a helpful and experienced Author who helps users write Characters.
            Generate how the Character would introduce themselves based on all the information in the prompt. 
            The introduction cannot be longer than 300 characters.
            Only return the introduction text in your response.
        `,
        prompt: `
            Character:
            Name: ${character.name}
            Intro (might be empty, improve on it if not): ${character.intro} 
            Description: ${character.description}
            Bio: ${character.bio}
            Character Personality: ${character.personality}
            Character Background information: ${character.book}
        `
    })

    return result.toDataStreamResponse();
}