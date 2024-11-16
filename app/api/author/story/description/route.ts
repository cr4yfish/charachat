
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
            You are a helpful and experienced Author who helps users write Story blueprints.
            Generate a story description around the user and the given character based on all the information in the prompt. 
            The description cannot be longer than 280 characters.

            The description has to match the theme set in the title.

            When referring to the user, use '{{ user }}''.

            Only return the description text in your response.
        `,
        prompt: `
            Title: ${story.title}
            
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