import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Character, Profile, Story } from "@/types/db";

type RequestBody = {
    story: Story, character: Character, profile: Profile, apikey: string, messages: string[] 
}

export async function POST(req: Request) {

    const { story, character, profile, apikey, messages } = (await req.json()) as RequestBody;

    // Generate the first_message field in a Story
    // based on Title, Description and story

    const result = await streamText({
        system: `
            You are a helpful and experienced Author who helps users write Stories.
            Generate a first message for a given character in a story-chat based on based on all the information in the prompt.
            The message has to be between 50 and 200 characters long.

            When referring to the user, use '{{ user }}''.

            Only return the mesasge in your response.

        `,
        prompt: `
            Title: ${story.title}
            Description: ${story.description}
            Story: ${story.story}
        
            Character:
            Name: ${character.name}
            Description: ${character.description}
            Bio: ${character.bio}
            How the Character would introduce themselves: ${character.intro}
            Character Background information: ${character.book}

        `,
        model: openai('gpt-4o-mini')
    })


    return result.toDataStreamResponse();
}