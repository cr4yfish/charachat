import { Lora } from "@/types/db"

export type ImageModel = {
    id: ImageModelId;
    title: string;
    style: string;
    provider: ProviderId;
    type: ModelType;
    extra_lora?: Lora[];
}

export type VideoModel = {
    id: VideoModelId;
    title: string;
    provider: ProviderId;
    type: ModelType;
    extra_lora?: string;
}

export type LLM = {
    key: ModelId,
    name: string,
    usecase?: string
    provider: ProviderId,
    tags?: string[],
    features?: Feature[],
    isFree?: boolean,
    contextLength?: number,
}


export type LLMGroup = {
    provider: ProviderId,
    llms: LLM[]
}

export type AudioModel = {
    key: ModelId,
    name: string,
    usecase?: string,
    provider: ProviderId,
    tags?: string[]
    type: ModelType
}

export type ModelId = 
    // Groq
    "meta-llama/llama-4-scout-17b-16e-instruct" |
    "meta-llama/llama-4-maverick-17b-128e-instruct" |

    // "llama3-groq-70b-8192-tool-use-preview" |
    // "llama-3.2-90b-vision-preview" |
    // "llama-3.3-70b-versatile" |

    "deepseek-r1-distill-llama-70b" |
    
    "qwen/qwen3-32b" |
    "qwen-qwq-32b" |
    "mistral-saba-24b" |

    "compound-beta" |
    "compound-beta-mini" | 

    // OpenAI
    "gpt-4o" |
    "gpt-4o-mini" |
    "gpt-4o-mini-realtime-preview-2024-12-17" |
    "gpt-4o-mini-search-preview-2025-03-11" |
    
    "chatgpt-4o-latest" |

    "gpt-4.1-nano-2025-04-14" |
    "gpt-4.1-mini-2025-04-14"  |  
    "gpt-4.1-2025-04-14" |    

    "o4-mini-2025-04-16" |
    "o3-2025-04-16" |

    "codex-mini-latest" |

    // Gemini
    "gemini-2.5-pro" |
    "gemini-2.5-flash" |
    "gemini-2.5-flash-lite-preview-06-17" |


    // Mistral
    "open-mistral-nemo" |

    // Anthropic
    "claude-3-5-haiku-latest" |
    "claude-sonnet-4-20250514" |
    "claude-opus-4-20250514" |

    "ollama" |
    "openai-compatible" |

    // DeepSeek
    "deepseek-chat" |
    "deepseek-reasoner" |

    // xAI
    "grok-beta" |

    // Cohere
    "command-r-plus" |
    "command-r" |


    "c4ai-aya-expanse-32b" |

    // Replicate
    "black-forest-labs/flux-schnell" |
    "black-forest-labs/FLUX.1-schnell" |
    "xtts-v2" |
    "zsxkib/pulid:43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0" |
    "fal-ai/ltx-video/image-to-video" |

    // OpenRouter
    "openrouter/custom" |
    "minimax/minimax-m1" |
    "microsoft/wizardlm-2-8x22b" |
    "deepseek/deepseek-chat-v3-0324:free" |
    "deepseek/deepseek-r1-0528:free" |
    "google/gemini-2.0-flash-exp:free" |
    "google/gemma-3-27b-it:free" |
    "qwen/qwen3-14b:free" |
    "qwen/qwen3-32b:free"

    

export type Feature = "tools"

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

export const invertIcons: ProviderId[] = [
  "OpenAI", "Anthropic", "Gemini", "xAI", "Replicate", "Groq", "OpenRouter"
]

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
    "delta-lock/ponynai3:ea38949bfddea2db315b598620110edfa76ddaf6313a18e6cbc6a98f496a34e9" |
    "charlesmccarthy/pony-sdxl:b070dedae81324788c3c933a5d9e1270093dc74636214b9815dae044b4b3a58a" |
    "delta-lock/noobai-xl:dceca5ec09fd6fd0e5dbd5d3dcefb25f73802560e5b89008021fd07c9691e880" |
    "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3" |
    "cjwbw/animagine-xl-3.1:6afe2e6b27dad2d6f480b59195c221884b6acc589ff4d05ff0e5fc058690fbb9" |
    "aisha-ai-official/animagine-xl-4.0:057e2276ac5dcd8d1575dc37b131f903df9c10c41aed53d47cd7d4f068c19fa5" |
    "aisha-ai-official/wai-nsfw-illustrious-v11:152992479714a33337898ed89d84dd2e74a6111834638d04135f4efc2cba94f2" |
    "google/imagen-3"

export type VideoModelId = 
    "fofr/ltx-video:983ec70a06fd872ef4c29bb6b728556fc2454125a5b2c68ab51eb8a2a9eaa46a" |
    "fal-ai/ltx-video/image-to-video"

export type ModelType = 
    "text-to-image" |
    "image-to-image" |
    "text-to-speech" |
    "speech-to-text" |
    "speech-to-speech" |
    "text-to-text" |
    "text-to-video" |
    "image-to-video"