import "server-only";

import { LanguageModelV1 } from '@ai-sdk/provider';

import { createGroq } from '@ai-sdk/groq';
export async function getGroq(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const groq = createGroq({
        baseURL: baseURL || "https://api.groq.com/openai/v1",
        apiKey: apiKey
    })

    return groq(modelId);
}

import { createOpenAI } from '@ai-sdk/openai';
export async function getOpenAI(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const openai = createOpenAI({
        apiKey: apiKey,
    });

    return openai(modelId);
}

import { createAnthropic  } from '@ai-sdk/anthropic';
export async function getAnthropic(modelId: string, apiKey?: string, baseURL?: string,): Promise<LanguageModelV1> {
    const anthropic = createAnthropic({
        baseURL: baseURL || 'https://api.anthropic.com/v1',
        apiKey: apiKey
    });

    return anthropic(modelId);
}

import { createGoogleGenerativeAI } from '@ai-sdk/google';
export async function getGemini(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const gemini = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    return gemini(modelId, { structuredOutputs: false});
}

import { createMistral } from '@ai-sdk/mistral';
export async function getMistral(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const mistral = createMistral({
        apiKey: apiKey
    });

    return mistral(modelId);
}

import { createCohere } from "@ai-sdk/cohere";
export async function getCohere(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const cohere = createCohere({
        apiKey: apiKey
    })

    return cohere(modelId);
}

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
export async function getOpenRouter(modelName: string, apiKey?: string): Promise<LanguageModelV1> {
    const openRouter = createOpenRouter({
        apiKey: apiKey,
    });

    return openRouter(modelName);
}

export async function getOpenAICompatible(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const openAICompatible = createOpenAI({
        baseURL: baseURL,
        apiKey: apiKey
    })

    return openAICompatible(modelId);
}

import { createXai } from "@ai-sdk/xai";
export async function getXai(modelId: string, baseURL?: string, apiKey?: string): Promise<LanguageModelV1> {
    const xai = createXai({
        baseURL: baseURL,
        apiKey: apiKey
    })

    return xai(modelId);
}

import { createDeepSeek } from '@ai-sdk/deepseek';
export async function getDeepSeek(modelId: string, apiKey?: string): Promise<LanguageModelV1> {
    const deepSeek = createDeepSeek({
        apiKey: apiKey
    });

    return deepSeek(modelId);
}