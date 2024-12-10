import { Profile } from "@/types/db";

export const getProfileAPIKey = (modelId: ModelId | string, profile: Profile): string | undefined => {
    switch(modelId as ModelId) {
        case 'llama3-groq-70b-8192-tool-use-preview':
        case "llama-3.2-90b-vision-preview":
        case "llama-3.3-70b-versatile":
        case "gemma2-9b-it":
            if(profile.groq_encrypted_api_key && profile.groq_encrypted_api_key.length > 0) {
                return profile.groq_encrypted_api_key;
            }
            return process.env.GROQ_API_KEY;

        case 'ollama':
            return profile.ollama_encrypted_api_key;
            
        case "gpt-4o-mini":
        case "gpt-4o":
        case "gpt-4-turbo":
        case "o1-preview":
        case "o1-mini":
            return profile.openai_encrypted_api_key;
        
        case "gemini-1.5-flash":
        case "gemini-1.5-pro":
            return profile.gemini_encrypted_api_key;

        case "claude-3-5-sonnet-latest":
        case "claude-3-5-haiku-latest":
            return profile.anthropic_encrypted_api_key;

        case "command-r-plus":
        case "command-r":
        case "c4ai-aya-expanse-32b":
            return profile.cohere_encrypted_api_key;

        case "grok-beta":
            if(profile.x_ai_encrypted_api_key && profile.x_ai_encrypted_api_key.length > 0) {
                return profile.x_ai_encrypted_api_key;
            }
            return process.env.X_AI_API_KEY;

        case "open-mistral-nemo":
            if(profile.mistral_encrypted_api_key && profile.mistral_encrypted_api_key.length > 0) {
                return profile.mistral_encrypted_api_key;
            }
            return process.env.MISTRAL_API_KEY;

        case "openrouter":
            return profile.openrouter_encrypted_api_key;

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
    "llama-3.3-70b-versatile" |
    "gemma2-9b-it" |
    "ollama" |
    "gpt-4o-mini" |
    "gpt-4o" |
    "gpt-4-turbo" |
    "o1-preview" |
    "o1-mini" |
    "gemini-1.5-flash" |
    "gemini-1.5-pro" |
    "open-mistral-nemo" |
    "claude-3-5-sonnet-latest" |
    "claude-3-5-haiku-latest" |
    "openai-compatible" |
    "grok-beta" |
    "command-r-plus" |
    "command-r" |
    "c4ai-aya-expanse-32b" |
    "black-forest-labs/flux-schnell" |
    "black-forest-labs/FLUX.1-schnell" |
    "xtts-v2" |
    "zsxkib/pulid:43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0" |
    "fal-ai/ltx-video/image-to-video" |
    "openrouter"

export type ProviderId = 
    "OpenAI" |
    "Groq" |
    "Mistral" |
    "Anthropic" |
    "Gemini" |
    "Cohere" |
    "xAI" |
    "You" |
    "Huggingface" |
    "Replicate" |
    "FAL" |
    "OpenRouter"

export type ImageModelId = 
    "black-forest-labs/FLUX.1-schnell" |
    "strangerzonehf/Flux-Midjourney-Mix2-LoRA" |
    "XLabs-AI/flux-RealismLora" |
    "xey/sldr_flux_nsfw_v2-studio" |
    "shuttleai/shuttle-3.1-aesthetic" |
    "Djrango/Qwen2vl-Flux" |
    "Shakker-Labs/AWPortraitCN" |
    "stabilityai/sdxl-turbo" |
    "luma/photon-flash" |
    "black-forest-labs/flux-schnell" |
    "nvidia/sana" |
    "black-forest-labs/flux-1.1-pro-ultra" |
    "stability-ai/stable-diffusion-3.5-large" |
    "stability-ai/stable-diffusion-3.5-large-turbo" |
    "datacte/proteus-v0.3"

export type Provider = 
    "huggingface" |
    "replicate"

export type ImageModel = {
    id: ImageModelId;
    title: string;
    style: string;
    provider: Provider;
}

export const imageModels: ImageModel[] = [
    {
        id: "black-forest-labs/FLUX.1-schnell",
        title: "Flux Schnell",
        style: "Versitile",
        provider: "huggingface"
    },
    {
        id: "strangerzonehf/Flux-Midjourney-Mix2-LoRA",
        title: "Midjourney",
        style: "Midjourney",
        provider: "huggingface"
    },
    {
        id: "XLabs-AI/flux-RealismLora",
        title: "Flux Realism",
        style: "Realistic",
        provider: "huggingface"
    },
    {
        id: "xey/sldr_flux_nsfw_v2-studio",
        title: "Flux NSFW v2",
        style: "Uncensored",
        provider: "huggingface"
    },
    {
        id: "shuttleai/shuttle-3.1-aesthetic",
        title: "Shuttle 3.1",
        style: "Aesthetic",
        provider: "huggingface"
    },
    {
        id: "Djrango/Qwen2vl-Flux",
        title: "Qwen x Flux",
        style: "Easy Prompt",
        provider: "huggingface"
    },
    {
        id: "Shakker-Labs/AWPortraitCN",
        title: "Portraits",
        style: "Portraits",
        provider: "huggingface"
    },
    {
        id: "stabilityai/sdxl-turbo",
        title: "SDXL-Turbo",
        style: "Fast",
        provider: "huggingface"
    },
    {
        id: "stability-ai/stable-diffusion-3.5-large-turbo",
        title: "Stable Diffusion 3.5 Large Turbo",
        style: "RP Turbo",
        provider: "replicate"
    },
    {
        id: "luma/photon-flash",
        title: "Photon Flash",
        style: "RP Photon",
        provider: "replicate"
    },
    {
        id: "black-forest-labs/flux-schnell",
        title: "Flux Replicate",
        style: "RP Flux",
        provider: "replicate"
    },
    {
        id: "nvidia/sana",
        title: "NVIDIA Sana",
        style: "RP Sana",
        provider: "replicate"
    },
    {
        id: "black-forest-labs/flux-1.1-pro-ultra",
        title: "Flux Pro Ultra",
        style: "RP Flux Pro",
        provider: "replicate"
    },
    {
        id: "stability-ai/stable-diffusion-3.5-large",
        title: "Stable Diffusion 3.5 Large",
        style: "RP SD3.5",
        provider: "replicate"
    },
    {
        id: "datacte/proteus-v0.3",
        title: "Proteus v0.3",
        style: "RP Anime",
        provider: "replicate"
    },

]

export const isFreeModel = (modelId: ModelId) => {
    switch(modelId) {
        case "open-mistral-nemo":
        case "llama-3.2-90b-vision-preview":
        case "llama3-groq-70b-8192-tool-use-preview":
        case "llama-3.3-70b-versatile":
        case "gemma2-9b-it":
            return true;
    }
    return false;
}


export type LLMType = {
    key: ModelId,
    name: string,
    usecase?: string
    provider: ProviderId,
    tags?: string[]
}

export const LLMs: LLMType[] = [
    {
        "key": "llama-3.3-70b-versatile",
        "name": "Llama 3.3 70b",
        "usecase": "Came out on 9.11",
        "provider": "Groq",
        "tags": ["Free", "New", "Quality"]
    },
    {
        "key": "llama-3.2-90b-vision-preview",
        "name": "Llama 3.2 90b",
        "usecase": "One of the best, censors some things",
        "provider": "Groq",
        "tags": ["Free", "Fast", "Quality"]
    },
    {
        "key": "llama3-groq-70b-8192-tool-use-preview",
        "name": "Llama3 70b",
        "usecase": "Good quality, sometimes stupid",
        "provider": "Groq",
        "tags": ["Free", "Fast", "Kinda Uncensored"]
    },
    {
        "key": "grok-beta",
        "name": "Grok",
        "usecase": "Allrounder, low quality sometimes",
        "provider": "xAI",
        "tags": ["Fast", "Uncensored"]
    },
    {
        "key": "open-mistral-nemo",
        "name": "Nemo",
        "usecase": "Fast",
        "provider": "Mistral",
        "tags": ["Free", "Fast", "Privacy nightmare"]
    },
    {
        "key": "gemma2-9b-it",
        "name": "Gemma 2 9b",
        "usecase": "Experimental",
        "provider": "Groq",
        "tags": ["Free", "New", "Fast"]
    },
    {
        "key": "claude-3-5-sonnet-latest",
        "name": "Claude Sonnet",
        "provider": "Anthropic",
        "usecase": "Best model out there, expensive",
        "tags": ["Quality", "Uncensored"]
    },
    {
        "key": "claude-3-5-haiku-latest",
        "name": "Claude Haiku",
        "provider": "Anthropic",
        "usecase": "Much cheaper than Sonnet, still good",
        "tags": ["Quality", "Fast", "Uncensored"]
    },
    {
        "key": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "usecase": "Unbeatable price, Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"]
    },
    {
        "key": "gpt-4o",
        "name": "GPT-4o",
        "usecase": "Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"]
    },
    {
        "key": "gpt-4-turbo",
        "name": "GPT-4 Turbo",
        "provider": "OpenAI",
        "usecase": "Has some working Jailbreaks",
        "tags": ["Quality", "Fast"]
    },
    {
        "key": "o1-preview",
        "name": "o1",
        "provider": "OpenAI",
        "usecase": "Unbelievable quality",
        "tags": ["Quality", "Fast"]
    },
    {
        "key": "o1-mini",
        "name": "o1 Mini",
        "provider": "OpenAI",
        "usecase": "Very good quality for lower cost",
        "tags": ["Quality", "Fast"]
    },

    {
        "key": "gemini-1.5-flash",
        "name": "Gemini Flash",
        "provider": "Gemini",
        "usecase": "Very fast, free",
        "tags": ["Quality", "Fast"]
    },
    {
        "key": "gemini-1.5-pro",
        "name": "Gemini Pro",
        "provider": "Gemini",
        "usecase": "Fast, high quality",
        "tags": ["Fast"]
    },
    {
        "key": "command-r-plus",
        "name": "Command R Plus",
        "provider": "Cohere",
        "usecase": "Fast, high quality",
        "tags": ["Quality"]
    },
    {
        "key": "command-r",
        "name": "Command R",
        "provider": "Cohere",
        "usecase": "",
        "tags": ["Cheap", "Fast"]
    },
    {
        "key": "c4ai-aya-expanse-32b",
        "name": "Aya Expanse 32b",
        "provider": "Cohere",
        "usecase": "",
        "tags": ["Fast", "Old"]
    },
    {
        "key": "ollama",
        "name": "Ollama",
        "provider": "You",
        "usecase": "Best privacy, since you control it"
    },
    {
        "key": "openrouter",
        "name": "OpenRouter",
        "provider": "OpenRouter",
        "usecase": "Depends on your model"
    },
    {
        "key": "openai-compatible",
        "name": "Your openAI model",
        "provider": "You",
        "usecase": "Depends on your model"
    },

    // non-text models
    {
        "key": "black-forest-labs/FLUX.1-schnell",
        "name": "Flux Schnell",
        "provider": "Huggingface"
    },
    {
        "key": "black-forest-labs/flux-schnell",
        "name": "Flux Schnell",
        "provider": "Replicate"
    },
    {
        "key": "xtts-v2",
        "name": "XTTS v2",
        "provider": "Replicate"
    },
    {
        "key": "zsxkib/pulid:43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0",
        "name": "Pulid",
        "provider": "Replicate"
    },
    {
        "key": "fal-ai/ltx-video/image-to-video",
        "name": "LTX image to video",
        "provider": "FAL"
    }

]