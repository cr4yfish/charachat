
import { Character, Profile, Story } from "@/types/db";
import { author } from "@/functions/ai/author";

type RequestBody = {
    story: Story, character: Character, profile: Profile, apikey: string, messages: string[] 
}

export async function POST(req: Request) {

    const { story, character, profile } = (await req.json()) as RequestBody;

    // Generate the story field in a Story
    // based on Title and Description

    const result = await author({
        profile: profile,
        systemText: `
            You are a helpful and experienced Author who helps users write Stories.
            Generate a story around the user and the given character based on based on all the information in the prompt. 
            The story has to be between 500 and 1000 characters long.

            When referring to the user, use '{{ user }}''.

            Only return the story in your response.

        `,
        prompt: `
            Title: ${story.title}
            Description: ${story.description}
        
            Character:
            Name: ${character.name}
            Description: ${character.description}
            Bio: ${character.bio}
            How the Character would introduce themselves: ${character.intro}
            Character Background information: ${character.book}

        `,
    })


    return result.toDataStreamResponse();
}