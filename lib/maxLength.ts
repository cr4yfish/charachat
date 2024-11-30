
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
    image_prompt: 500,
}

export const _CHAT_MAX_LENGTH: MaxLength = {
    title: 100,
    description: 300,
    dynamic_book: 10000,
    negative_prompt: 2000,
}