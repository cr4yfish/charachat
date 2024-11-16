import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { createAnthropic  } from '@ai-sdk/anthropic';

import { LanguageModelV1 } from '@ai-sdk/provider';
import { Profile } from '@/types/db';

function getGroq(modelId: string, baseURL?: string, apiKey?: string): LanguageModelV1 {
    const groq = createOpenAI({
        baseURL: baseURL || "https://api.groq.com/openai/v1",
        apiKey: apiKey || process.env.GROQ_API_KEY
    })

    return groq(modelId);
}

function getOllama(modelId: string, baseURL?: string, apiKey?: string): LanguageModelV1 {
    const ollama = createOllama({
        baseURL: baseURL || 'https://api.ollama.com',
        headers: {
            'Authorization': `Bearer ${apiKey || process.env.OLLAMA_API_KEY}`
        }
    });

    return ollama(modelId);
}

function getAnthropic(modelId: string, apiKey?: string, baseURL?: string,): LanguageModelV1 {
    const anthropic = createAnthropic({
        baseURL: baseURL || 'https://api.anthropic.com/v1',
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });

    return anthropic(modelId);
}

function getOpenAI(modelId: string, apiKey?: string): LanguageModelV1 {
    const openai = createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY
    });

    return openai(modelId);
}

function getGemini(modelId: string, apiKey?: string): LanguageModelV1 {
    const gemini = createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GEMINI_API_KEY
    });

    return gemini(modelId);
}

function getMistral(modelId: string, apiKey?: string, baseURL?: string): LanguageModelV1 {
    const mistral = createMistral({
        baseURL: baseURL || 'https://api.mistral.com',
        apiKey: apiKey || process.env.MISTRAL_API_KEY
    });

    return mistral(modelId);
}


type GetLanguageModelProps = {
    modelId: string;
    baseURL?: string;
    apiKey?: string;
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
        "key": "anthropic",
        "name": "Anthropic",
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
    }
]

export function getLanguageModel({ modelId, baseURL, apiKey }: GetLanguageModelProps): LanguageModelV1 {
    switch(modelId) {

        case 'llama3-groq-70b-8192-tool-use-preview':
            return getGroq(modelId, baseURL, apiKey);

        case 'ollama':
            return getOllama(modelId, baseURL, apiKey);

        case "gpt-4o-mini":
        case "gpt-4o":   
            return getOpenAI(modelId, apiKey);
        
        case "gemini-1.5-flash":
            return getGemini(modelId, apiKey);

        case "open-mistral-nemo":
            return getMistral(modelId, apiKey, baseURL);

        case "claude-3-5-sonnet-latest":
        case "claude-3-5-haiku-latest":
            return getAnthropic(modelId, apiKey);

        default:
            return getOpenAI(modelId, apiKey);
    }
}

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
            return profile.openai_encrypted_api_key;
    }
}