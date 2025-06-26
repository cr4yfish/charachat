import "server-only";

import { checkIsEncrypted, decryptMessage } from "../crypto/client";
import { getKeyServerSide } from "../crypto/server";
import { getLLMById, getProviderAPIKey, isFreeLLM } from "./utils";
import { Profile } from "../db/types/profile";
import { ModelId } from "./types";
import { LanguageModelV1 } from "ai";
import { getAnthropic, getCohere, getDeepSeek, getGemini, getGroq, getMistral, getOpenAI, getOpenAICompatible, getOpenRouter, getXai } from "./providers";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export async function getModelApiKey(profile: Profile, modelid?: ModelId): Promise<string> {
    const selectedModelId = modelid || profile.default_llm as ModelId;
    const selectedModel = getLLMById(selectedModelId);

    if(!selectedModel) {
        throw new Error(ERROR_MESSAGES.LLM_MODEL_NOT_FOUND);
    }

    // This can be undefined if user has no API key for this model
    const encryptedAPIKey = getProviderAPIKey(selectedModel.provider, profile);

    // User doesnt have one and also no env variable set
    if(!encryptedAPIKey) {
        throw new Error(ERROR_MESSAGES.LLM_MODEL_ACCESS_DENIED);
    }

    // encryptedApiKey is set and model is free
    // key is also not encrypted -> env variable
    if(isFreeLLM(selectedModel) && !checkIsEncrypted(encryptedAPIKey)) {
        return encryptedAPIKey;
    }

    // encryptedAPikey is set, model is not free
    // key is also encrypted -> key from user
    if(encryptedAPIKey && checkIsEncrypted(encryptedAPIKey)) {
        const key = await getKeyServerSide();
        return decryptMessage(encryptedAPIKey, key);
    } 
    throw new Error(ERROR_MESSAGES.LLM_MODEL_ACCESS_DENIED);
}

type GetLanguageModelProps = {
    modelId: ModelId;
    baseURL?: string;
    apiKey?: string;
}


export async function getLanguageModel({ modelId, baseURL, apiKey }: GetLanguageModelProps): Promise<LanguageModelV1> {
    
    const model = getLLMById(modelId as ModelId);
    if(!model) {
        throw new Error(ERROR_MESSAGES.LLM_MODEL_NOT_FOUND);
    }

    switch(model.provider) {

        case "Groq":
            return getGroq(modelId, baseURL, apiKey);

        case "OpenAI":
            return getOpenAI(modelId, apiKey);
        
        case "Gemini":
            return getGemini(modelId, apiKey);

        case "Mistral":
            return getMistral(modelId, apiKey);

        case "Anthropic":
            return getAnthropic(modelId, apiKey);

        case "You":
            return getOpenAICompatible(modelId, baseURL, apiKey);

        case "xAI":
            return getXai(modelId, baseURL, apiKey);

        case "Cohere":
            return getCohere(modelId, apiKey);

        case "OpenRouter":
            return getOpenRouter(modelId, apiKey);

        // case "openrouter":
        //     const profile = await getCurrentUser();
        //     const model = profile.openrouter_model;
        //     if(!model) {
        //         throw new Error("OpenRouter Model not found");
        //     }
        //     const key = await getKeyServerSide();
        //     const decryptedModel = decryptMessage(model, Buffer.from(key, 'hex'));
        //     return getOpenRouter(decryptedModel, apiKey);

        case "DeepSeek":
            return getDeepSeek(modelId, apiKey);
            
        default:
            throw new Error(ERROR_MESSAGES.LLM_MODEL_NOT_FOUND);
    }
}