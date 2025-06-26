import { Provider } from "../../types";

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
]