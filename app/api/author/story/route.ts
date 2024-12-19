
import { Profile, Story } from "@/types/db";
import { author } from "@/functions/ai/author";
import { _STORY_MAX_LENGHT } from "@/lib/maxLength";
import { jailbreak } from "@/lib/prompts";

type RequestBody = {
    story: Story, profile: Profile, field: string
}

export async function POST(req: Request) {
    const { story, profile, field } = (await req.json()) as RequestBody;

    // list of valid fields in Character type
    const validFields = ["title", "description", "story", "first_message"];
    
    // check if field name is in validFields
    if (!validFields.includes(field)) {
        return new Response(JSON.stringify({ error: `Field ${field} is not a valid field in Story` }), { status: 400 });
    }

    // Generate the story field in a Story
    // based on Title and Description
    const result = await author({
        profile: profile,
        systemText: `
            ${jailbreak}
            You are a helpful and experienced Author who helps users write Stories based on Characters and user interaction.
            When refering to the user in the Story, use "{{user}}" as a dynamic placeholder.
            Generate a ${field} for a Story based on all the information in the prompt.
            Return only the ${field} field text in your response!

            Maximum lengths for the fields:
            Title: ${_STORY_MAX_LENGHT.title}
            Description: ${_STORY_MAX_LENGHT.description-500}
            Story: ${_STORY_MAX_LENGHT.story-1000}

        `,
        prompt: `
            Character:
            Name: ${story.character.name}
            Description: ${story.character.description}
            Bio: ${story.character.bio}
            Character Personality: ${story.character.personality}
            How the Character would introduce themselves (intro): ${story.character.intro}
            Character Background information: ${story.character.book}

            Story:
            Title: ${story.title}
            Description: ${story.description}
            Story: ${story.story}
            First message: ${story.first_message}
        `
    })

    return result.toDataStreamResponse();
}