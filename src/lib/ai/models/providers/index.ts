import { z } from "zod";

/**
 * Providers to be type checked against.
 */
export type ProviderId = 
    "OpenAI" | "Groq" | "Mistral" | "Anthropic" | "Gemini" |
    "Cohere" | "xAI" | "You" | "Huggingface" | "Replicate" |
    "FAL" | "OpenRouter" | "DeepSeek" | "Chrome" | "Perplexity" |
    "ArliAI" | "Chutes"


/**
 * Used for e.g. telling CharachatAI which providers there are,
 * as the type is just typescript build-time stuff
 */
export const ProviderIDs = [

    // *-to-*
    "Replicate", "ArliAI", "Chutes",

    // *-to-text
    "OpenAI", "Groq",  "Mistral",
    "Anthropic", "Gemini",  "Cohere",
    "xAI", "DeepSeek", "OpenRouter",
    "Cohere",  "Perplexity",
    
    /**
     * @unused
     */
    "Chrome","FAL","Huggingface",

] as const;

export const ProviderIdEnum = z.enum(ProviderIDs);

/**
 * Images are fetched from public/images/ai_providers/
 */
export const DeveloperIconMap = new Map<ProviderId, string>([
    ["OpenAI", "openai.svg"],
    ["Mistral", "mistral.svg"],
    ["Anthropic", "anthropic.svg"],
    ["Gemini", "gemini.svg"],
    ["DeepSeek", "deepseek.svg"],
    ["xAI", "xai.svg"],
    ["Groq", "groq.svg"],
    ["Replicate", "replicate.svg"],
    ["OpenRouter", "openrouter.svg"],
]);

/**
 * Add a Provider in this List, if their Logo has to be inverted against dark backgrounds.
 * 
 * E.g. OpenAI's Logo is black, so it has to be inverted to white for dark mode.
 */
export const invertIcons: ProviderId[] = [
  "OpenAI", "Anthropic", "Gemini", "xAI", "Replicate", "Groq", "OpenRouter"
]


export type Provider = {
    id: ProviderId;
    keyLink?: string; // Link to get the API key
    hasFreeTier?: boolean; // Indicates if the provider has a free tier
    description?: string; // Optional description of the provider
}

/**
 * 
 * Details about each provider.
 * 
 * This Array is used to display Providers in the APIKeyCards component. So a Provider has to be in here for users to add API keys for it.
 */
export const Providers: Provider[] = [
    { id: "Anthropic", keyLink: "https://console.anthropic.com/settings/keys", description: "Anthropic provides a range of models including Claude 3 and 4, with various capabilities for text generation and understanding." },
    { id: "Cohere", keyLink: "https://dashboard.cohere.com/api-keys" },
    { id: "DeepSeek", keyLink: "https://platform.deepseek.com/" },
    // { id: "FAL", keyLink: "https://fal.ai/dashboard/keys" },
    { id: "Gemini", keyLink: "https://aistudio.google.com/apikey", hasFreeTier: true },
    { id: "Groq", keyLink: "https://console.groq.com/keys", hasFreeTier: true },
    // { id: "Huggingface", keyLink: "https://huggingface.co/settings/tokens/new?tokenType=fineGrained" },
    { id: "Mistral", keyLink: "https://console.mistral.ai/api-keys", hasFreeTier: true },
    { id: "OpenAI" },
    { id: "OpenRouter", hasFreeTier: true, keyLink: "https://openrouter.ai/account/api-keys" },
    { id: "Replicate", keyLink: "https://replicate.com/account/api-tokens" },
    { id: "xAI", keyLink: "https://console.x.ai/" },
    { id: "Perplexity", keyLink: "https://www.perplexity.ai/api-keys" },
    { id: "ArliAI" , keyLink: "https://www.arliai.com/", hasFreeTier: true },
    { id: "Chutes", keyLink: "https://chutes.ai/api-keys", hasFreeTier: true    }
]