import { streamText } from "ai";
import { Character, Profile, Story } from "@/types/db";
import { getLanguageModel } from "@/functions/ai/llm";

type RequestBody = {
    story: Story, character: Character, profile: Profile, apikey: string, messages: string[] 
}

export async function POST(req: Request) {

    const { character, profile } = (await req.json()) as RequestBody;



    // Generate the story field in a Story
    // based on Title and Description

    const result = await streamText({
        system: `
            You are a helpful and experienced Author who helps users write Stories.
            Generate a Title for a story around the user and the given character based on based on all the information in the prompt. 
            The title has to be less than 50 characters long.

            When referring to the user, use '{{ user }}''.

            Be creative and make sure the title is engaging and interesting. The title should intrigue the reader and make them want to read the story.

            Only return the Title in your response.

        `,
        prompt: `
            Character:
            Name: ${character.name}
            Description: ${character.description}
            Bio: ${character.bio}
            How the Character would introduce themselves: ${character.intro}
            Character Background information: ${character.book}
        `,
        model: getLanguageModel(profile.default_llm),
    })


    return result.toDataStreamResponse();
}