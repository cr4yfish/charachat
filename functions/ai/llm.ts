"use server";

import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider';
import { createAnthropic  } from '@ai-sdk/anthropic';
import { createVertex } from '@ai-sdk/google-vertex';

import { LanguageModelV1 } from '@ai-sdk/provider';

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
            'Authorization': `Bearer ${apiKey || process.env.OLLAMA_API_KEY}`
        }
    });

    return ollama(modelId);
}

async function getAnthropic(modelId: string, apiKey?: string, baseURL?: string,): Promise<LanguageModelV1> {
    const anthropic = createAnthropic({
        baseURL: baseURL || 'https://api.anthropic.com/v1',
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });

    return anthropic(modelId);
}

async function getOpenAI(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const openai = createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY
    });

    return openai(modelId);
}

async function getGemini(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const gemini = createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GEMINI_API_KEY
    });

    return gemini(modelId);
}

async function getMistral(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const mistral = createMistral({
        apiKey: apiKey || process.env.MISTRAL_API_KEY
    });

    return mistral(modelId);
}

async function getUnrestricted(): Promise<LanguageModelV1> {

    const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS!);
    const project = process.env.GOOGLE_VERTEX_PROJECT!;
    const location = process.env.GOOGLE_VERTEX_LOCATION!;
    
    const vertex = createVertex({
        project: project,
        location: location,
        googleAuthOptions: {
            credentials: creds
        },
        
    })
    return vertex("projects/charachat/locations/us-central1/endpoints/1827049675782356992", {
        safetySettings: [
            { category: 'HARM_CATEGORY_UNSPECIFIED', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ]
    });
}

async function getNVIDIA(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const nvidia = createOpenAI({
        baseURL: baseURL,
        apiKey: apiKey
    })

    return nvidia(modelId);
}

type GetLanguageModelProps = {
    modelId: string;
    baseURL?: string;
    apiKey?: string;
}


export async function getLanguageModel({ modelId, baseURL, apiKey }: GetLanguageModelProps): Promise<LanguageModelV1> {
    
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
            return getMistral(modelId, apiKey);

        case "claude-3-5-sonnet-latest":
        case "claude-3-5-haiku-latest":
            return getAnthropic(modelId, apiKey);

        case "llama-3_2-3b-instruct-uncensored":
            return getUnrestricted();

        case "nemotron-4-340b-instruct":
            return getNVIDIA(modelId, baseURL, apiKey);

        default:
            return getOpenAI(modelId, apiKey);
    }
}

