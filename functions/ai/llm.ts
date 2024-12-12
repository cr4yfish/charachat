"use server";

import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { createAnthropic  } from '@ai-sdk/anthropic';
import { createXai } from "@ai-sdk/xai";
import { createCohere } from "@ai-sdk/cohere";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { LanguageModelV1 } from '@ai-sdk/provider';
import { Profile } from '@/types/db';
import { getProfileAPIKey, isFreeModel, ModelId } from '@/lib/ai';
import { checkIsEncrypted, decryptMessage } from '@/lib/crypto';
import { getKeyServerSide } from '../serverHelpers';
import { getCurrentUser } from '../db/auth';

async function getGroq(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const groq = createOpenAI({
        baseURL: baseURL || "https://api.groq.com/openai/v1",
        apiKey: apiKey || process.env.GROQ_API_KEY
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

async function getOpenRouter(modelName: string, apiKey?: string): Promise<LanguageModelV1> {
    const openRouter = createOpenRouter({
        apiKey: apiKey,
    });

    return openRouter(modelName);
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
    
    switch(modelId as ModelId) {

        case 'llama3-groq-70b-8192-tool-use-preview':
        case "llama-3.2-90b-vision-preview":
        case "llama-3.3-70b-versatile":
        case "gemma2-9b-it":
            return getGroq(modelId, baseURL, apiKey);

        case 'ollama':
            return getOllama(modelId, baseURL, apiKey);

        case "gpt-4o-mini":
        case "gpt-4o":
        case "gpt-4-turbo":
        case "o1-preview":
        case "o1-mini":
            return getOpenAI(modelId, apiKey);
        
        case "gemini-1.5-flash":
        case "gemini-1.5-pro":
        case "gemini-2.0-flash-exp":
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

        case "openrouter":
            const profile = await getCurrentUser();
            const model = profile.openrouter_model;
            if(!model) {
                throw new Error("OpenRouter Model not found");
            }
            const key = await getKeyServerSide();
            const decryptedModel = decryptMessage(model, Buffer.from(key, 'hex'));
            return getOpenRouter(decryptedModel, apiKey);

            
        default:
            throw new Error("Model not found");
    }
}


export async function getModelApiKey(profile: Profile, model?: ModelId): Promise<string> {
    const selectedModel = model || profile.default_llm as ModelId;

    // This can be undefined if user has no API key for this model
    const encryptedAPIKey = getProfileAPIKey(selectedModel, profile);

    // User doesnt have one and also no env variable set
    if(!encryptedAPIKey) {
        throw new Error("You do not have access to this model: " + selectedModel);
    }

    // encryptedApiKey is set and model is free
    // key is also not encrypted -> env variable
    if(isFreeModel(selectedModel) && !checkIsEncrypted(encryptedAPIKey)) {
        return encryptedAPIKey;
    }

    // encryptedAPikey is set, model is not free
    // key is also encrypted -> key from user
    if(encryptedAPIKey && checkIsEncrypted(encryptedAPIKey)) {
        const key = await getKeyServerSide();
        const keyBuffer = Buffer.from(key, 'hex');
        return decryptMessage(encryptedAPIKey, keyBuffer);
    } 
    throw new Error("Could not get API Key for this model: " + selectedModel);
}