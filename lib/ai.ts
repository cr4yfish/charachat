import { Lora, Profile } from "@/types/db";

export const getProfileAPIKey = (modelId: ModelId | string, profile: Profile): string | undefined => {
    switch(modelId as ModelId) {
        case 'llama3-groq-70b-8192-tool-use-preview':
        case "deepseek-r1-distill-llama-70b":
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
        case "o1-preview":
        case "o1-mini":
            return profile.openai_encrypted_api_key;
        
        case "gemini-1.5-flash":
        case "gemini-1.5-pro":
        case "gemini-2.0-flash-exp":
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

        case "gryphe/mythomax-l2-13b:free":
            return process.env.PUBLIC_OPENROUTER_API_KEY;

        case "openrouter":
            return profile.openrouter_encrypted_api_key;

        case "deepseek-chat":
            return profile.deepseek_encrypted_api_key;

        default:
            return undefined;
    }
}

/**
 * Can adjust the temperature for some models
 * @param modelId 
 * @param temp 
 * @returns 
 */
export const getCustomTemperature = (modelId: ModelId, temp: number): number | undefined => {
    switch(modelId) {
        case "deepseek-chat":
            // 0.6 -> 1.3, recommended by DeepSeek for General Conversation
            // 0.8 -> 1.5, recommended by DeepSeek for creative writing
            // 1.0 -> 1.7
            return temp+.7;

        default: 
            return temp;
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
    "deepseek-r1-distill-llama-70b" |
    "gemma2-9b-it" |
    "ollama" |
    "gpt-4o-mini" |
    "gpt-4o" |
    "o1-preview" |
    "o1-mini" |
    "gemini-1.5-flash" |
    "gemini-1.5-pro" |
    "gemini-2.0-flash-exp" |
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
    "openrouter" |
    "gryphe/mythomax-l2-13b:free" |
    "deepseek-chat"

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
    "OpenRouter" |
    "DeepSeek"

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
    "nvidia/sana:c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6" |
    "black-forest-labs/flux-1.1-pro-ultra" |
    "black-forest-labs/flux-1.1-pro" |
    "stability-ai/stable-diffusion-3.5-large" |
    "stability-ai/stable-diffusion-3.5-large-turbo" |
    "datacte/proteus-v0.3:b28b79d725c8548b173b6a19ff9bffd16b9b80df5b18b8dc5cb9e1ee471bfa48" |
    "makinsongary698/jh:4423082b68f497cf91a93031872cb5c3f7d5f8a9de8fa32d4db94e17094049b9" |
    "datacte/flux-aesthetic-anime:2c3677b83922a0ac99493467805fb0259f55c4f4f7b1988b1dd1d92f083a8304" |
    "delta-lock/ponynai3:delta-lock/ponynai3:d6e79b8adc56619f2067d42cffce922ff374e0c292a65b2683d33045a4049535" |
    "charlesmccarthy/pony-sdxl:b070dedae81324788c3c933a5d9e1270093dc74636214b9815dae044b4b3a58a" |
    "delta-lock/noobai-xl:8ce6383446e13f0397ef97eeeeedcac942ced182fb4550e32247e6dabaa7f5b5" |
    "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3" |
    "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9"

export type VideoModelId = 
    "fofr/ltx-video:983ec70a06fd872ef4c29bb6b728556fc2454125a5b2c68ab51eb8a2a9eaa46a" |
    "fal-ai/ltx-video/image-to-video"


export type Provider = 
    "huggingface" |
    "replicate" |
    "fal"

export type ModelType = 
    "text-to-image" |
    "image-to-image" |
    "text-to-audio" |
    "text-to-video" |
    "image-to-video"

export type ImageModel = {
    id: ImageModelId;
    title: string;
    style: string;
    provider: Provider;
    type: ModelType;
    extra_lora?: Lora[];
}

export type VideoModel = {
    id: VideoModelId;
    title: string;
    provider: Provider;
    type: ModelType;
    extra_lora?: string;
}

export const videoModels: VideoModel[] = [
    {
        id: "fal-ai/ltx-video/image-to-video",
        title: "LTX image to video",
        provider: "fal",
        type: "image-to-video"
    },
    {
        id: "fofr/ltx-video:983ec70a06fd872ef4c29bb6b728556fc2454125a5b2c68ab51eb8a2a9eaa46a",
        title: "LTX video",
        provider: "replicate",
        type: "text-to-video"
    }
]

export const imageModels: ImageModel[] = [
    {
        id: "black-forest-labs/FLUX.1-schnell",
        title: "Flux Schnell",
        style: "Versitile",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "strangerzonehf/Flux-Midjourney-Mix2-LoRA",
        title: "Midjourney",
        style: "Midjourney",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "XLabs-AI/flux-RealismLora",
        title: "Flux Realism",
        style: "Realistic",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "xey/sldr_flux_nsfw_v2-studio",
        title: "Flux NSFW v2",
        style: "Uncensored",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "shuttleai/shuttle-3.1-aesthetic",
        title: "Shuttle 3.1",
        style: "Aesthetic",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "Djrango/Qwen2vl-Flux",
        title: "Qwen x Flux",
        style: "Easy Prompt",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "Shakker-Labs/AWPortraitCN",
        title: "Portraits",
        style: "Portraits",
        provider: "huggingface",
        type: "text-to-image"
    },
    {
        id: "stabilityai/sdxl-turbo",
        title: "SDXL-Turbo",
        style: "Fast",
        provider: "huggingface",
        type: "text-to-image"
    },

    {
        id: "black-forest-labs/flux-schnell",
        title: "Flux Schnell",
        style: "Flux Fast",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "black-forest-labs/flux-1.1-pro",
        title: "Flux Pro",
        style: "Flux Pro",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "black-forest-labs/flux-1.1-pro-ultra",
        title: "Flux Pro Ultra",
        style: "Flux Ultra",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3",
        title: "Flux Dev Single Lora",
        style: "Flux LoRa",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9",
        title: "animagine xl 3.1",
        style: "Animagine",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "delta-lock/noobai-xl:8ce6383446e13f0397ef97eeeeedcac942ced182fb4550e32247e6dabaa7f5b5",
        title: "noobai-xl",
        style: "NoobAI-XL",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "delta-lock/ponynai3:delta-lock/ponynai3:d6e79b8adc56619f2067d42cffce922ff374e0c292a65b2683d33045a4049535",
        title: "Pony AI3",
        style: "Pony Anime",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "stability-ai/stable-diffusion-3.5-large-turbo",
        title: "Stable Diffusion 3.5 Large Turbo",
        style: "SD Turbo",
        provider: "replicate",
        type: "text-to-image"
    },
    {
        id: "stability-ai/stable-diffusion-3.5-large",
        title: "Stable Diffusion 3.5 Large",
        style: "SD3.5",
        provider: "replicate",
        type: "text-to-image"
    },
]

export const getExtraImageModelOptions = (modelId: ImageModelId) => {
    switch(modelId) {
        case "delta-lock/ponynai3:delta-lock/ponynai3:d6e79b8adc56619f2067d42cffce922ff374e0c292a65b2683d33045a4049535":
            return {
                steps: 100,
                vae: "tPonynai3_v65",
                width: 864,
                height: 1184
            }
        case "charlesmccarthy/pony-sdxl:b070dedae81324788c3c933a5d9e1270093dc74636214b9815dae044b4b3a58a":
            return {
                step: 100,
                width: 864,
                height: 1184
            }
        case "delta-lock/noobai-xl:8ce6383446e13f0397ef97eeeeedcac942ced182fb4550e32247e6dabaa7f5b5":
            return {
                negative_prompt: "(worst quality, low quality, ugly:1.4), furry, (multiple_views:2), multiple_views, (comic, 4koma, censored, bar_censor, mosaic_censoring), poorly drawn hands,poorly drawn feet,poorly drawn face,out of frame,mutation,mutated,extra limbs,extra legs,extra arms,disfigured,deformed,cross-eye,blurry,(bad art, bad anatomy:1.4),blurred,text,watermark,negative_hand-neg,((( three fingers, four fingers, six fingers, seven fingers, extra fingers, missing fingers, fused fingers, deformed fingers, ugly fingers,deformed hands, bad hands, worst time, worst hands, wrong hands, twisted hands, ugly hands,deformed toes, fused toes, missing toes,wrong feet, deformed feet, ugly feet))),unaestheticXL_cbp62 -neg,NEGATIVE_HANDS,",
                width: 832,
                height: 1216,
                steps: 35,
                vae: "noobaiXLNAIXL_epsilonPred11Version",
                model: "noobaiXLNAIXL_epsilonPred11Version",
                scheduler: "Euler a",
            }
    }
}

export const isFreeModel = (modelId: ModelId) => {
    switch(modelId) {
        case "open-mistral-nemo":
        case "llama-3.2-90b-vision-preview":
        case "llama3-groq-70b-8192-tool-use-preview":
        case "llama-3.3-70b-versatile":
        case "gemma2-9b-it":
        case "gryphe/mythomax-l2-13b:free":
        case "deepseek-r1-distill-llama-70b":
            return true;
    }
    return false;
}


export const llmDoesntSupportTools = (modelId: ModelId) => {
    switch(modelId) {
        case "llama-3.3-70b-versatile":
        case "gryphe/mythomax-l2-13b:free":
        case "openrouter":
        case "deepseek-r1-distill-llama-70b":
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
        "key": "deepseek-r1-distill-llama-70b",
        "name": "DeepSeek R1",
        "provider": "Groq",
        "usecase": "Fast, high quality",
        "tags": ["Free", "Quality", "Fast"]
    },
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
        "key": "gryphe/mythomax-l2-13b:free",
        "name": "Mythomax L2 13b",
        "usecase": "Popular for some reason",
        "provider": "OpenRouter",
        "tags": ["Free", "Stupid", "Uncensored"]
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
        "key": "deepseek-chat",
        "name": "DeepSeek v3",
        "provider": "DeepSeek",
        "usecase": "New model",
        "tags": ["Quality", "Fast"]
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
        "key": "gemini-2.0-flash-exp",
        "name": "Gemini 2.0 Flash",
        "provider": "Gemini",
        "usecase": "Fast, high quality",
        "tags": ["Fast", "New"]
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
        "name": "Pulid Image to Image",
        "provider": "Replicate"
    },
    {
        "key": "fal-ai/ltx-video/image-to-video",
        "name": "LTX image to video",
        "provider": "FAL"
    }

]