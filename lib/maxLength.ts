
type MaxLength = {
    [key: string]: number;
}

export const _CHARACTER_MAX_LENGTH: MaxLength = {
    name: 100,
    description: 5000,
    personality: 5000,
    bio: 10000,
    intro: 10000,
    book: 15000,
    first_message: 10000,
    system_prompt: 5000,
    image_prompt: 1000,
    scenario: 10000,
}

export const _CHAT_MAX_LENGTH: MaxLength = {
    title: 100,
    description: 300,
    dynamic_book: 10000,
    negative_prompt: 2000,
}

export const _STORY_MAX_LENGHT: MaxLength = {
    title: 100,
    description: 1000,
    story: 10000,
    first_message: 5000,
}

export const _PERSONA_MAX_LENGTH: MaxLength = {
    fullName: 100,
    bio: 2000,
}