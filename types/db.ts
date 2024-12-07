export type Category = {
    id: string;
    created_at?: string;
    title: string;
    description?: string;
}

export type Character = {
    id: string;
    created_at?: string;
    owner: Profile;
    name: string;
    description: string;
    image_link?: string;
    bio?: string;
    intro?: string;
    book?: string;
    category?: Category;
    is_private: boolean;
    is_nsfw?: boolean;
    is_unlisted?: boolean;
    personality?: string;
    chats?: number;
    likes?: number;
    is_liked?: boolean;
    system_prompt?: string;
    image_prompt?: string;
    first_message?: string;
    speaker_link?: string;
    scenario?: string;
    tags?: string[];
    tags_full?: Tag[];
}

export type Chat = {
    id: string;
    created_at?: string;
    user: Profile;
    title: string;
    description: string;
    character: Character;
    last_message_at?: string;
    dynamic_book?: string;
    story?: Story;
    llm: string;
    last_message?: string;
    persona?: Persona;
    negative_prompt?: string;
    response_length: number;
    temperature: number;
    frequency_penalty: number;
}

export type Profile = {
    user: string;
    created_at?: string;
    username: string;
    first_name: string;
    last_name?: string;
    bio?: string;
    public_bio?: string;
    avatar_link?: string;
    tokens: number;
    default_llm: string;
    ollama_base_url?: string;
    ollama_encrypted_api_key?: string;
    groq_base_url?: string;
    groq_encrypted_api_key?: string;
    openai_encrypted_api_key?: string;
    gemini_encrypted_api_key?: string;
    mistral_base_url?: string;
    mistral_encrypted_api_key?: string;
    anthropic_encrypted_api_key?: string;
    hf_encrypted_api_key?: string;
    replicate_encrypted_api_key?: string;
    cohere_encrypted_api_key?: string;
    fal_gpt_encrypted_api_key?: string;
    x_ai_encrypted_api_key?: string;
    openrouter_model?: string;
    openrouter_encrypted_api_key?: string;
    theme?: string;
}

export type Story = {
    id: string;
    created_at?: string;
    creator: Profile;
    character: Character;
    title: string;
    description: string;
    image_link: string;
    story: string;
    first_message: string;
    chats?: number;
    likes?: number;
    is_private: boolean;
    extra_characters?: string[];
    extra_characters_client?: Character[];
}

export type Message = {
    id: string;
    created_at?: string;
    chat: Chat;
    character: Character;
    user: Profile;
    from_ai: boolean;
    content: string;
}

export type Tag = {
    id: string;
    created_at?: string;
    name: string;
    description: string;
}

export type User_Tier = {
    user: Profile;
    tier: number;
}

export type Persona = {
    id: string;
    created_at?: string;
    full_name: string;
    bio?: string;
    avatar_link?: string;
    creator: Profile;
    is_private: boolean;
}

export type Stats = {
    timeframe: string;
    count: number;
    accumulated_count: number;
}