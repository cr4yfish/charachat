import { Profile } from "@/types/db";

export const getProfileAPIKey = (modelId: string, profile: Profile): string | undefined => {
    switch(modelId) {
        case 'llama3-groq-70b-8192-tool-use-preview':
            return profile.groq_encrypted_api_key;

        case 'ollama':
            return profile.ollama_encrypted_api_key;
            
        case "gpt-4o-mini":
        case "gpt-4o": 
            return profile.openai_encrypted_api_key;
        
        case "gemini-1.5-flash":
            return profile.gemini_encrypted_api_key;

        case "open-mistral-nemo":
            return profile.mistral_encrypted_api_key;

        case "claude-3-5-sonnet-latest":
        case "claude-3-5-haiku-latest":
            return profile.anthropic_encrypted_api_key;

        default:
            return undefined;
    }
}

export const LLMsWithAPIKeys = (profile: Profile) => {
    return LLMs.filter((llm) => {
        if(getProfileAPIKey(llm.key, profile) || llm.key === "llama-3_2-3b-instruct-uncensored") {
            return llm;
        }
    })
}

export const LLMs = [
    {
        "key": "llama3-groq-70b-8192-tool-use-preview",
        "name": "llama3 70b",
    },
    {
        "key": "ollama",
        "name": "Ollama",
    },
    {
        "key": "gpt-4o-mini",
        "name": "GPT-4o Mini",
    },
    {
        "key": "gpt-4o",
        "name": "GPT-4o",
    },
    {
        "key": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash",
    },
    {
        "key": "open-mistral-nemo",
        "name": "Open Mistral Nemo",
    },
    {
        "key": "claude-3-5-sonnet-latest",
        "name": "Claude 3.5 Sonnet"
    },
    {
        "key": "claude-3-5-haiku-latest",
        "name": "Claude 3.5 Haiku"
    },
    {
        "key": "llama-3_2-3b-instruct-uncensored",
        "name": "Llama3.2 Unrestricted"
    }
]