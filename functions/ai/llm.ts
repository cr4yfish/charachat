"use server";

import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { createAnthropic  } from '@ai-sdk/anthropic';
import { createXai } from "@ai-sdk/xai";
import { createCohere } from "@ai-sdk/cohere";

import { LanguageModelV1 } from '@ai-sdk/provider';
import { Profile } from '@/types/db';
import { cookies } from 'next/headers';
import { getProfileAPIKey, isFreeModel, ModelId } from '@/lib/ai';
import { decryptMessage } from '@/lib/crypto';

async function getGroq(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const groq = createOpenAI({
        baseURL: baseURL || "https://api.groq.com/openai/v1",
        apiKey: apiKey
    })

    return groq(modelId);
}

async function getOllama(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const ollama = createOllama({
        baseURL: baseURL || 'https://api.ollama.com',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    return ollama(modelId);
}

async function getAnthropic(modelId: string, apiKey?: string, baseURL?: string,): Promise<LanguageModelV1> {
    const anthropic = createAnthropic({
        baseURL: baseURL || 'https://api.anthropic.com/v1',
        apiKey: apiKey
    });

    return anthropic(modelId);
}

async function getOpenAI(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const openai = createOpenAI({
        apiKey: apiKey
    });

    return openai(modelId);
}

async function getGemini(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const gemini = createGoogleGenerativeAI({
        apiKey: apiKey
    });

    return gemini(modelId);
}

async function getMistral(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const mistral = createMistral({
        apiKey: apiKey || process.env.MISTRAL_API_KEY
    });

    return mistral(modelId);
}

async function getCohere(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const cohere = createCohere({
        apiKey: apiKey
    })

    return cohere(modelId);
}

async function getOpenAICompatible(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const openAICompatible = createOpenAI({
        baseURL: baseURL,
        apiKey: apiKey
    })

    return openAICompatible(modelId);
}

async function getXai(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const xai = createXai({
        baseURL: baseURL,
        apiKey: apiKey || process.env.X_AI_API_KEY
    })

    return xai(modelId);
}

type GetLanguageModelProps = {
    modelId: string;
    baseURL?: string;
    apiKey?: string;
}


export async function getLanguageModel({ modelId, baseURL, apiKey }: GetLanguageModelProps): Promise<LanguageModelV1> {
    
    switch(modelId) {

        case 'llama3-groq-70b-8192-tool-use-preview':
        case "llama-3.2-90b-vision-preview":
            return getGroq(modelId, baseURL, apiKey);

        case 'ollama':
            return getOllama(modelId, baseURL, apiKey);

        case "gpt-4o-mini":
        case "gpt-4o":
            return getOpenAI(modelId, apiKey);
        
        case "gemini-1.5-flash":
            return getGemini(modelId, apiKey);

        case "open-mistral-nemo":
            return getMistral(modelId, apiKey);

        case "claude-3-5-sonnet-latest":
        case "claude-3-5-haiku-latest":
            return getAnthropic(modelId, apiKey);

        case "openai-compatible":
            return getOpenAICompatible(modelId, baseURL, apiKey);

        case "grok-beta":
            return getXai(modelId, baseURL, apiKey);

        case "command-r-plus":
        case "command-r":
        case "c4ai-aya-expanse-32b":
            return getCohere(modelId, apiKey);
            
        default:
            throw new Error("Model not found");
    }
}


export async function getModelApiKey(profile: Profile, model?: ModelId): Promise<string> {

    const cookiesStore = cookies();

    // Generate the story field in a Story
    // based on Title and Description
    const key = cookiesStore.get("key")?.value;

    if(!key) {
        throw new Error("No key cookie");
    }

    let decryptedAPIKey: string | undefined = undefined;
    const encryptedAPIKey = getProfileAPIKey(model || profile.default_llm as ModelId, profile);
    if(!encryptedAPIKey && !isFreeModel(model || profile.default_llm as ModelId)) {
        throw new Error("No API key found");
    } else if(encryptedAPIKey) {
        decryptedAPIKey = decryptMessage(encryptedAPIKey, Buffer.from(key, 'hex'));
    }

    if(!decryptedAPIKey) {
        throw new Error("You do not have access to this model");   
    }

    return decryptedAPIKey;
}