
type MaxLength = {
    [key: string]: number;
}

export const _CHARACTER_MAX_LENGTH: MaxLength = {
    name: 100,
    description: 5000,
    personality: 1000,
    bio: 5000,
    intro: 5000,
    book: 8000,
    first_message: 5000,
    system_protmp: 2000,
    image_prompt: 1000,
    system_prompt: 2000,
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