import { ProviderId } from "../providers"

export type TextModelId = 
    /**
     *   Groq
     */
    "meta-llama/llama-4-scout-17b-16e-instruct" |  "meta-llama/llama-4-maverick-17b-128e-instruct" |

    // "llama3-groq-70b-8192-tool-use-preview" |
    // "llama-3.2-90b-vision-preview" |
    // "llama-3.3-70b-versatile" |

    "deepseek-r1-distill-llama-70b" |
    
    "qwen/qwen3-32b" | "qwen-qwq-32b" |
    "mistral-saba-24b" |

    "compound-beta" |  "compound-beta-mini" | 

    /**
     *  OpenAI
     */
    "gpt-4o" | "gpt-4o-mini" | "gpt-4o-mini-realtime-preview-2024-12-17" | "gpt-4o-mini-search-preview-2025-03-11" |
    
    "chatgpt-4o-latest" |

    "gpt-4.1-nano-2025-04-14" |  "gpt-4.1-mini-2025-04-14"  |   "gpt-4.1-2025-04-14" |    

    "o4-mini-2025-04-16" |  "o3-2025-04-16" |

    "codex-mini-latest" |

    /**
     *  Gemini
     */
    "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.5-flash-lite-preview-06-17" |


    /**
     * Mistral
     */

    // Small mistral models
    "ministral-3b-latest" | // Efficient, can be used for public use (currently used in search)
    "ministral-8b-latest" | // A little more expensive than the 3B model, but more capable
    "mistral-small-latest" | // Over 10x the price of 3B/8B
 
    // Large mistral models
    "mistral-medium-latest" |  "mistral-large-latest" |

    /**
     *  Anthropic
     */
    "claude-3-5-haiku-latest" | "claude-sonnet-4-20250514" |  "claude-opus-4-20250514" |

    /**
     * miscellaneous models
     */
    "ollama" |"openai-compatible" |

    /**
     *  DeepSeek
     */
    "deepseek-chat" | "deepseek-reasoner" |

    /**
     * xAI
     */
    "grok-3-latest" | "grok-3-mini-latest" |

    /**
     * Cohere
     */
    "command-r-plus" | "command-r" | "command-a-03-2025" | "c4ai-aya-expanse-32b" |

    /**
     * Perplexity
     */
    "sonar-pro" | "sonar" | "sonar-deep-research" |

    /**
     * Replicate
     */
    "black-forest-labs/flux-schnell" | "black-forest-labs/FLUX.1-schnell" |
    "xtts-v2" |
    "zsxkib/pulid:43d309c37ab4e62361e5e29b8e9e867fb2dcbcec77ae91206a8d95ac5dd451a0" |
    "fal-ai/ltx-video/image-to-video" |

    /**
     * OpenRouter
     */
    "openrouter/custom" | "minimax/minimax-m1" | "microsoft/wizardlm-2-8x22b" | "deepseek/deepseek-chat-v3-0324:free" |
    "deepseek/deepseek-r1-0528:free" |  "google/gemini-2.0-flash-exp:free" | "google/gemma-3-27b-it:free" |
    "qwen/qwen3-14b:free" |  "qwen/qwen3-32b:free" |

    /**
     * ArliAI
     */
    "DS-R1-Distill-70B-ArliAI-RpR-v4-Large" | "Gemma-3-27B-ArliAI-RPMax-v3" | "Llama-3.3-70B-ArliAI-RPMax-v2" | "Gemma-3-27B-CardProjector-v4" |
    "Llama-3.3-70B-Legion-V2.1"


export type Feature = "tools" | "reasoning"

export type LLM = {

    /**
     * Use for API calls, this is the unique identifier for the model.
     */
    key: TextModelId,

    /**
     * Actual model name
     */
    name: string,

    /**
     * Optional Simple name for the model
     */
    alias?: string,
    usecase?: string
    provider: ProviderId,
    tags?: string[],
    features?: Feature[],
    isFree?: boolean,
    contextLength?: number,

    /**
     * Whether this model should show up in "simple mode".
     */
    recommended?: boolean,
}


export type LLMGroup = {
    provider: ProviderId,
    llms: LLM[]
}


export const LLMs: LLM[] = [
    {
        key: "meta-llama/llama-4-maverick-17b-128e-instruct",
        alias: "Llama",
        name: "Llama 4 Maverick",
        provider: "Groq",
        usecase: "Excellent quality, makes mistakes sometimes",
        tags: ["Quality"],
        features: ["tools"],
        isFree: true,
        recommended: true,
        contextLength: 131072
    },
    {
        "key": "meta-llama/llama-4-scout-17b-16e-instruct",
        "name": "Llama 4 Scout",
        "provider": "Groq",
        "usecase": "Very fast",
        "tags": ["Quality"],
        features: ["tools"],
        isFree: true,
        contextLength: 131072
    },
    {
        "key": "deepseek-r1-distill-llama-70b",
        "name": "DeepSeek R1",
        alias: "DeepSeek Reasoning",
        "provider": "Groq",
        "usecase": "Fast, high quality",
        "tags": ["Thinking", "Uncensored"],
        features: ["reasoning"],
        isFree: true,
        contextLength: 131072,
        recommended: true
    },
    {
        "key": "qwen/qwen3-32b",
        "name": "Qwen 3 32B",
        "provider": "Groq",
        "usecase": "Reliable and efficient for complex tasks",
        "tags": ["Quality", "Multilingual"],
        features: ["reasoning", "tools"],
        isFree: true,
        contextLength: 131072
    },
    {
        "key": "qwen-qwq-32b",
        "name": "QWQ 32B",
        "provider": "Groq",
        "usecase": "Fast, high quality",
        "tags": ["Thinking", "Uncensored"],
        features: ["reasoning"],
        isFree: true,
        contextLength: 131072
    },
    {
        key: "mistral-saba-24b",
        name: "Mistral Saba 24B",
        provider: "Groq",
        usecase: "",
        tags: ["Quality"],
        isFree: true,
    },

    // Running into "empty message" errors with these models
    // {
    //     key: "compound-beta",
    //     name: "Compound Beta",
    //     provider: "Groq",
    //     usecase: "Fast, high quality",
    //     tags: ["Thinking", "Uncensored"],
    //     isFree: true,
    // },
    // {
    //     key: "compound-beta-mini",
    //     name: "Compound Beta Mini",
    //     provider: "Groq",
    //     usecase: "Fast, high quality",
    //     tags: ["Thinking", "Uncensored"],
    //     isFree: true,
    // },
    
    {
        "key": "grok-3-latest",
        "name": "Grok 3",
        "usecase": "Fascist AI",
        "provider": "xAI",
        "tags": ["Fast", "Fuck Elon Musk", "Uncensored"],
        features: ["tools"],
    },
    {
        "key": "grok-3-mini-latest",
        "name": "Grok 3 mini",
        "usecase": "Smol fascist AI",
        "provider": "xAI",
        "tags": ["Fast", "Fuck Elon Musk", "Uncensored"],
        features: ["tools"],
    },

    {
        "key": "ministral-3b-latest",
        "name": "Ministral 3b",
        "usecase": "Used internally for search",
        "provider": "Mistral",
        "tags": ["Cheap", "Fast"],
        isFree: true
    },
    {
        "key": "ministral-8b-latest",
        "name": "Ministral 3b",
        "usecase": "Used internally for search",
        "provider": "Mistral",
        "tags": ["Cheap", "Fast"],
        isFree: true
    },
    {
        "key": "mistral-medium-latest",
        "name": "Mistral Medium",
        alias: "Mistral",
        "usecase": "Flagship Mistral model",
        "provider": "Mistral",
        "tags": ["Economic", "Fast"],
        features: ["tools"],
        isFree: true,
        contextLength: 128000,
        recommended: true,
    },
    {
        "key": "mistral-large-latest",
        "name": "Mistral Large",
        "usecase": "Largest Mistral model, older than Medium",
        "provider": "Mistral",
        "tags": ["Cheap", "Fast"],
        features: ["tools"],
        isFree: true,
        contextLength: 128000
    },
    {
        key: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        alias: "Claude",
        provider: "Anthropic",
        usecase: "Storytelling beast",
        tags: ["Quality", "Uncensored"],
        features: ["tools"],
        contextLength: 200000,
        recommended: true,
    },
    {
        key: "claude-opus-4-20250514",
        name: "Claude Opus 4",
        provider: "Anthropic",
        usecase: "Best model out there, expensive",
        tags: ["Quality", "Uncensored"],
        features: ["tools"],
        contextLength: 200000
    },
    {
        "key": "claude-3-5-haiku-latest",
        "name": "Claude Haiku",
        "provider": "Anthropic",
        "usecase": "Much cheaper than Sonnet, still good",
        "tags": ["Quality", "Fast", "Uncensored"],
        features: ["tools"],
        contextLength: 200000
    },


    {
        "key": "deepseek-chat",
        "name": "DeepSeek v3",
        "provider": "DeepSeek",
        "usecase": "New model",
        "tags": ["Quality", "Fast"],
        features: ["tools"],
    },
    {
        "key": "deepseek-reasoner",
        "name": "DeepSeek Reasoner",
        "provider": "DeepSeek",
        "usecase": "New model",
        "tags": ["Quality", "Fast"],
        features: ["reasoning"],
    },


    {
        "key": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "usecase": "Unbeatable price, Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"],
        features: ["tools"],
        contextLength: 128000,
    },

    /**
     * Use 4.1 instead
     * @deprecated
     */
    // {
    //     "key": "gpt-4o",
    //     "name": "GPT-4o",
    //     "usecase": "Incredibly accurate",
    //     "provider": "OpenAI",
    //     "tags": ["Quality", "Fast"],
    //     contextLength: 128000
    // },
    {
        "key": "gpt-4o-mini-realtime-preview-2024-12-17",
        "name": "GPT-4o Mini Realtime Preview",
        "usecase": "Realtime, Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"],
        features: ["tools"],
        contextLength: 128000
    },
    {
        "key": "gpt-4o-mini-search-preview-2025-03-11",
        "name": "GPT-4o Mini Search Preview",
        "usecase": "Search, Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"],
        features: ["tools"],
        contextLength: 128000
    },
    {
        key: "chatgpt-4o-latest",
        name: "ChatGPT 4o Latest",
        alias: "ChatGPT",
        provider: "OpenAI",
        usecase: "Talks nicely",
        tags: ["Quality", "Fast"],
        contextLength: 128000,
        recommended: true,
    },
    {
        key: "gpt-4.1-nano-2025-04-14",
        name: "GPT 4.1 Nano",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools"],
        contextLength: 1047576
    },
    {
        key: "gpt-4.1-mini-2025-04-14",
        name: "GPT 4.1 Mini",
        alias: "GPT 4.1 mini",
        provider: "OpenAI",
        usecase: "General purpose",
        tags: ["Quality", "Fast"],
        features: ["tools"],
        contextLength: 1047576,
        recommended: true
    },
    {
        key: "gpt-4.1-2025-04-14",
        name: "GPT 4.1",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools"],
        contextLength: 1047576
    },
    {
        key: "o4-mini-2025-04-16",
        name: "o4 Mini",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools", "reasoning"],
        contextLength: 200000
    },
    {
        key: "o3-2025-04-16",
        name: "o3",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools", "reasoning"],
        contextLength: 200000
    },
    {
        key: "codex-mini-latest",
        name: "Codex Mini Latest",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        contextLength: 128000
    },

 

    {
        key: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "Gemini",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools"],
    },
    {
        key: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "Gemini",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools"],
    },
    {
        key: "gemini-2.5-flash-lite-preview-06-17",
        name: "Gemini 2.5 Flash Lite Preview 06/17",
        provider: "Gemini",
        usecase: "",
        tags: ["Quality", "Fast"],
        features: ["tools"],
    },
    

    {
        "key": "command-a-03-2025",
        "name": "Command A",
        "provider": "Cohere",
        "usecase": "Cohere Flagship",
        "tags": ["Quality"],
        contextLength: 256000,
        features: [],
    },

    /**
     * ArliAI models
     */
    {
        key: "DS-R1-Distill-70B-ArliAI-RpR-v4-Large",
        name: "R1 RpR v4",
        provider: "ArliAI",
        contextLength: 65536
    },
    {
        key: "Llama-3.3-70B-ArliAI-RPMax-v2",
        name: "Llama RPMax v2",
        provider: "ArliAI",
        contextLength: 65536
    },
    {
        key: "Gemma-3-27B-ArliAI-RPMax-v3",
        name: "Gemma RPMax v3",
        provider: "ArliAI",
        contextLength: 32768
    },
    {
        key: "Gemma-3-27B-CardProjector-v4",
        name: "Gemma Card Projector",
        provider: "ArliAI",
        contextLength: 32768
    },
    {
        key: "Llama-3.3-70B-Legion-V2.1",
        name: "Llama Legion v2.1",
        provider: "ArliAI",
        contextLength: 65536
    },

    /**
     * Perplexity models
     */
    {
        key: "sonar-pro",
        name: "Sonar Pro",
        provider: "Perplexity",
        usecase: "Perplexity flagship model",
        tags: ["Quality", "Fast"],
        features: ["tools"],
    },
    {
        key: "sonar",
        name: "Sonar",
        provider: "Perplexity",
        usecase: "Perplexity lite model",
        tags: ["Quality", "Fast"],
        features: ["tools"],
    },
    {
        key: "sonar-deep-research",
        name: "Sonar Deep Research",
        provider: "Perplexity",
        usecase: "Perplexity research model",
        tags: ["Quality", "Fast"],
    },

    /**
     * OpenRouter
     */
    {
        key: "qwen/qwen3-14b:free",
        name: "Qwen 3 14B Free",
        usecase: "Free, fast, high quality",
        provider: "OpenRouter",
        tags: ["Fast", "Quality"],
        features: ["tools", "reasoning"],
        isFree: true,
    },
    {
        key: "qwen/qwen3-32b:free",
        name: "Qwen 3 32B Free",
        alias: "Qwen",
        usecase: "Exceptional reasoning and multilingual capabilities",
        provider: "OpenRouter",
        tags: ["Fast", "Quality", "Multilingual"],
        features: ["tools", "reasoning"],
        isFree: true,
        recommended: true,
        contextLength: 40960
    },
    {
        "key": "deepseek/deepseek-chat-v3-0324:free",
        "name": "DeepSeek Chat V3",
        alias: "DeepSeek Chat",
        "usecase": "Versatile",
        "provider": "OpenRouter",
        "tags": ["Uncensored"],
        features: ["tools"],
        isFree: true,
        contextLength: 163840,
        recommended: true
    },
    {
        "key": "deepseek/deepseek-r1-0528:free",
        "name": "DeepSeek R1",
        "usecase": "Free, fast, high quality",
        "provider": "OpenRouter",
        "tags": ["Fast", "Quality"],
        features: ["tools", "reasoning"],
        isFree: true,
        contextLength: 163840
    },
    {
        key: "google/gemini-2.0-flash-exp:free",
        name: "Gemini Flash Exp Free",
        usecase: "Free, fast, high quality",
        provider: "OpenRouter",
        tags: ["Fast", "Quality"],
        contextLength: 1048576,
        isFree: true,
    },
    {
        "key": "minimax/minimax-m1",
        "name": "MiniMax M1",
        "usecase": "Open Weight Reasoning",
        "provider": "OpenRouter",
        "tags": ["Open Weight"],
        contextLength: 1000000
    },
    {
        "key": "microsoft/wizardlm-2-8x22b",
        "name": "WizardLM-2 8x22B",
        "usecase": "Popular",
        "provider": "OpenRouter",
        "tags": ["Microsoft Model"],
        contextLength: 65536
    },
    {
        "key": "openrouter/custom",
        "name": "Other",
        "provider": "OpenRouter",
        "usecase": "Depends on your model",
    },

    {
        "key": "openai-compatible",
        "name": "Your openAI model",
        "provider": "You",
        "usecase": "Depends on your model"
    },

]