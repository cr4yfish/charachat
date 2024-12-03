import { Profile } from "@/types/db";

export const getProfileAPIKey = (modelId: ModelId | string, profile: Profile): string | undefined => {
    switch(modelId) {
        case 'llama3-groq-70b-8192-tool-use-preview':
        case "llama-3.2-90b-vision-preview":
            return profile.groq_encrypted_api_key;

        case 'ollama':
            return profile.ollama_encrypted_api_key;
            
        case "gpt-4o-mini":
        case "gpt-4o":
            return profile.openai_encrypted_api_key;
        
        case "gemini-1.5-flash":
            return profile.gemini_encrypted_api_key;

        case "claude-3-5-sonnet-latest":
        case "claude-3-5-haiku-latest":
            return profile.anthropic_encrypted_api_key;

        case "command-r-plus":
        case "command-r":
        case "c4ai-aya-expanse-32b":
            return profile.cohere_encrypted_api_key;

        case "grok-beta":
            return process.env.X_AI_API_KEY;

        case "open-nemo-mistral":
            return process.env.MISTRAL_API_KEY;

        default:
            return undefined;
    }
}

export const checkUserHasImageAPIKey = (profile: Profile): boolean => {
    if(profile.hf_encrypted_api_key || profile.hf_encrypted_api_key) {
        return true;
    }
    return false;
}

export const LLMsWithAPIKeys = (profile: Profile | undefined): LLMType[] => {
    return LLMs.filter((llm) => {

        if(
            isFreeModel(llm.key) ||
            (profile && getProfileAPIKey(llm.key, profile)) 
        ) {
            return llm;
        }
    })
}

export type ModelId = 
    "llama3-groq-70b-8192-tool-use-preview" |
    "llama-3.2-90b-vision-preview" |
    "ollama" |
    "gpt-4o-mini" |
    "gpt-4o" |
    "gemini-1.5-flash" |
    "open-mistral-nemo" |
    "claude-3-5-sonnet-latest" |
    "claude-3-5-haiku-latest" |
    "openai-compatible" |
    "grok-beta" |
    "command-r-plus" |
    "command-r" |
    "c4ai-aya-expanse-32b"


export type ImageModelId = 
    "black-forest-labs/FLUX.1-schnell"

export const isFreeModel = (modelId: ModelId) => {
    switch(modelId) {
        case "open-mistral-nemo":
        case "grok-beta":
            return true;
    }
}

export type LLMType = {
    key: ModelId,
    name: string,
    provider: string,
}

export const LLMs: LLMType[] = [
    {
        "key": "open-mistral-nemo",
        "name": "Nemo (free)",
        "provider": "Mistral"
    },
    {
        "key": "grok-beta",
        "name": "Grok (free)",
        "provider": "xAI"
    },
    
    {
        "key": "llama3-groq-70b-8192-tool-use-preview",
        "name": "llama3 70b",
        "provider": "Groq"
    },
    {
        "key": "llama-3.2-90b-vision-preview",
        "name": "Llama 3.2 90b",
        "provider": "Groq"
    },

    {
        "key": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "provider": "OpenAI"
    },
    {
        "key": "gpt-4o",
        "name": "GPT-4o",
        "provider": "OpenAI"
    },

    {
        "key": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash",
        "provider": "Google"
    },

    {
        "key": "claude-3-5-sonnet-latest",
        "name": "Claude 3.5 Sonnet",
        "provider": "Anthropic"
    },
    {
        "key": "claude-3-5-haiku-latest",
        "name": "Claude 3.5 Haiku",
        "provider": "Anthropic"
    },


    {
        "key": "command-r-plus",
        "name": "Command R Plus",
        "provider": "Cohere"
    },
    {
        "key": "command-r",
        "name": "Command R",
        "provider": "Cohere"
    },
    {
        "key": "c4ai-aya-expanse-32b",
        "name": "C4AI Aya Expanse 32b",
        "provider": "Cohere"
    },

    {
        "key": "ollama",
        "name": "Ollama",
        "provider": "You"
    },
    {
        "key": "openai-compatible",
        "name": "Your openAI model",
        "provider": "You"
    },

]