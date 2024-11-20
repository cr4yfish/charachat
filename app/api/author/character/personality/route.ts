
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
            Generate a very short Character personality based on all the information in the prompt. 
            The personality cannot be longer than 150 characters and should be keywords.
            Only return the personality text in your response.
        `,
        prompt: `
            Character:
            Name: ${character.name}
            Description: ${character.description}
            Bio: ${character.bio}
            How the Character would introduce themselves: ${character.intro}
            Character Background information: ${character.book}
        `
    })

    return result.toDataStreamResponse();
}