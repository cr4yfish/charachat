
import { Character, Profile } from "@/types/db";
import { author } from "@/functions/ai/author";
import { _CHARACTER_MAX_LENGTH } from "@/lib/maxLength";

type RequestBody = {
    character: Character, profile: Profile, field: string
}

export async function POST(req: Request) {
    const { character, profile, field } = (await req.json()) as RequestBody;

    // list of valid fields in Character type
    const validFields = ["description", "bio", "personality", "intro", "book", "system_prompt", "image_prompt", "scenario", "first_message"];
    
    // check if field name is in validFields
    if (!validFields.includes(field)) {
        return new Response(JSON.stringify({ error: `Field ${field} is not a valid field in Character` }), { status: 400 });
    }

    // Generate the story field in a Story
    // based on Title and Description
    const result = await author({
        profile: profile,
        systemText: `
            You are a helpful and experienced Author who helps users write Characters.
            Generate a Character ${field} based on all the information in the prompt.
            Return only the ${field} field text in your response!

            Maximum lengths for the fields:
            Name: ${_CHARACTER_MAX_LENGTH.name-500}
            Description: ${_CHARACTER_MAX_LENGTH.description-500}
            Bio: ${_CHARACTER_MAX_LENGTH.bio-500}
            Character Personality: ${_CHARACTER_MAX_LENGTH.personality-500}
            How the Character would introduce themselves (intro): ${_CHARACTER_MAX_LENGTH.intro-500}
            Character Background information: ${_CHARACTER_MAX_LENGTH.book-500}
            System Prompt addition: ${_CHARACTER_MAX_LENGTH.system_prompt-500}
            Image Prompt: ${_CHARACTER_MAX_LENGTH.image_prompt-500}
            Simple Scenario: ${_CHARACTER_MAX_LENGTH.scenario-500}

        `,
        prompt: `
            Character:
            Name: ${character.name}
            Description: ${character.description}
            Bio: ${character.bio}
            Character Personality: ${character.personality}
            How the Character would introduce themselves (intro): ${character.intro}
            Character Background information: ${character.book}
            System Prompt addition: ${character.system_prompt}
            Image Prompt: ${character.image_prompt}
            Simple Scenario: ${character.scenario}
        `
    })

    return result.toDataStreamResponse();
}