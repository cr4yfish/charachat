import { ProviderId } from "@/lib/ai/types";


export type APIKey = {
    encrypted_api_key: string;
    provider: ProviderId;
}

export type Profile = {
    user?: string;
    clerk_user_id?: string;
    id?: string;
    created_at?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    public_bio?: string;
    avatar_link?: string;
    tokens?: number;
    api_keys?: APIKey[];

    /**
     * Used for authoring and other AI-related features
     */
    default_llm?: string;
    /**
     * @deprecated
     */
    
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
    deepseek_encrypted_api_key?: string;
    theme?: string;
}