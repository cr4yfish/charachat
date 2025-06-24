import { LLM } from "../../types"

export const LLMs: LLM[] = [
    {
        key: "meta-llama/llama-4-maverick-17b-128e-instruct",
        name: "Llama 4 Maverick",
        provider: "Groq",
        usecase: "Cool model",
        tags: ["Free", "Quality"],
        isFree: true,
    },
    {
        "key": "meta-llama/llama-4-scout-17b-16e-instruct",
        "name": "Llama 4 Scout",
        "provider": "Groq",
        "usecase": "Very fast",
        "tags": ["Free", "Quality"],
        isFree: true,
    },
    {
        "key": "deepseek-r1-distill-llama-70b",
        "name": "DeepSeek R1",
        "provider": "Groq",
        "usecase": "Fast, high quality",
        "tags": ["Free", "Thinking", "Uncensored"],
        isFree: true,
    },
    {
        "key": "qwen/qwen3-32b",
        "name": "Qwen 3 32B",
        "provider": "Groq",
        "usecase": "Fast, high quality",
        "tags": ["Free", "Thinking", "Uncensored"],
        isFree: true,
    },
    {
        "key": "qwen-qwq-32b",
        "name": "QWQ 32B",
        "provider": "Groq",
        "usecase": "Fast, high quality",
        "tags": ["Free", "Thinking", "Uncensored"],
        isFree: true,
    },
    {
        key: "mistral-saba-24b",
        name: "Mistral Saba 24B",
        provider: "Groq",
        usecase: "",
        tags: ["Free", "Quality"],
        isFree: true,
    },

    // Running into "empty message" errors with these models
    // {
    //     key: "compound-beta",
    //     name: "Compound Beta",
    //     provider: "Groq",
    //     usecase: "Fast, high quality",
    //     tags: ["Free", "Thinking", "Uncensored"],
    //     isFree: true,
    // },
    // {
    //     key: "compound-beta-mini",
    //     name: "Compound Beta Mini",
    //     provider: "Groq",
    //     usecase: "Fast, high quality",
    //     tags: ["Free", "Thinking", "Uncensored"],
    //     isFree: true,
    // },
    
    {
        "key": "grok-3-latest",
        "name": "Grok 3",
        "usecase": "Fascist AI",
        "provider": "xAI",
        "tags": ["Fast", "Fuck Elon Musk", "Uncensored"],
    },
    {
        "key": "grok-3-mini-latest",
        "name": "Grok 3 mini",
        "usecase": "Smol fascist AI",
        "provider": "xAI",
        "tags": ["Fast", "Fuck Elon Musk", "Uncensored"],
    },

    {
        "key": "ministral-3b-latest",
        "name": "Ministral 3b",
        "usecase": "Used internally for search",
        "provider": "Mistral",
        "tags": ["Free", "Cheap", "Fast"],
        isFree: true
    },
    {
        "key": "ministral-8b-latest",
        "name": "Ministral 3b",
        "usecase": "Used internally for search",
        "provider": "Mistral",
        "tags": ["Free", "Cheap", "Fast"],
        isFree: true
    },
    {
        "key": "mistral-medium-latest",
        "name": "Ministral Medium",
        "usecase": "Capable",
        "provider": "Mistral",
        "tags": ["Free", "Cheap", "Fast"],
        isFree: true
    },
    {
        "key": "mistral-large-latest",
        "name": "Ministral Large",
        "usecase": "Still cheap but getting expensive",
        "provider": "Mistral",
        "tags": ["Free", "Cheap", "Fast"],
        isFree: true
    },
    {
        key: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        provider: "Anthropic",
        usecase: "Best model out there, expensive",
        tags: ["Quality", "Uncensored"],
        contextLength: 200000
    },
    {
        key: "claude-opus-4-20250514",
        name: "Claude Opus 4",
        provider: "Anthropic",
        usecase: "Best model out there, expensive",
        tags: ["Quality", "Uncensored"],
        contextLength: 200000
    },
    {
        "key": "claude-3-5-haiku-latest",
        "name": "Claude Haiku",
        "provider": "Anthropic",
        "usecase": "Much cheaper than Sonnet, still good",
        "tags": ["Quality", "Fast", "Uncensored"],
        contextLength: 200000
    },


    {
        "key": "deepseek-chat",
        "name": "DeepSeek v3",
        "provider": "DeepSeek",
        "usecase": "New model",
        "tags": ["Quality", "Fast"],
    },
    {
        "key": "deepseek-reasoner",
        "name": "DeepSeek Reasoner",
        "provider": "DeepSeek",
        "usecase": "New model",
        "tags": ["Quality", "Fast"],
    },


    {
        "key": "gpt-4o-mini",
        "name": "GPT-4o Mini",
        "usecase": "Unbeatable price, Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"],
        contextLength: 128000
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
        contextLength: 128000
    },
    {
        "key": "gpt-4o-mini-search-preview-2025-03-11",
        "name": "GPT-4o Mini Search Preview",
        "usecase": "Search, Incredibly accurate",
        "provider": "OpenAI",
        "tags": ["Quality", "Fast"],
        contextLength: 128000
    },
    {
        key: "chatgpt-4o-latest",
        name: "ChatGPT 4o Latest",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        contextLength: 128000
    },
    {
        key: "gpt-4.1-nano-2025-04-14",
        name: "GPT 4.1 Nano",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        contextLength: 1047576
    },
    {
        key: "gpt-4.1-mini-2025-04-14",
        name: "GPT 4.1 Mini",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        contextLength: 1047576
    },
    {
        key: "gpt-4.1-2025-04-14",
        name: "GPT 4.1",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        contextLength: 1047576
    },
    {
        key: "o4-mini-2025-04-16",
        name: "o4 Mini",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
        contextLength: 200000
    },
    {
        key: "o3-2025-04-16",
        name: "o3",
        provider: "OpenAI",
        usecase: "",
        tags: ["Quality", "Fast"],
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
    },
    {
        key: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        provider: "Gemini",
        usecase: "",
        tags: ["Quality", "Fast"],
    },
    {
        key: "gemini-2.5-flash-lite-preview-06-17",
        name: "Gemini 2.5 Flash Lite Preview 06/17",
        provider: "Gemini",
        usecase: "",
        tags: ["Quality", "Fast"],
    },
    

    {
        "key": "command-r-plus",
        "name": "Command R Plus",
        "provider": "Cohere",
        "usecase": "Fast, high quality",
        "tags": ["Quality"],
    },
    {
        "key": "command-r",
        "name": "Command R",
        "provider": "Cohere",
        "usecase": "",
        "tags": ["Cheap", "Fast"],
    },
    {
        "key": "c4ai-aya-expanse-32b",
        "name": "Aya Expanse 32b",
        "provider": "Cohere",
        "usecase": "",
        "tags": ["Fast", "Old"],
    },


    {
        key: "qwen/qwen3-14b:free",
        name: "Qwen 3 32B Free",
        usecase: "Free, fast, high quality",
        provider: "OpenRouter",
        tags: ["Free", "Fast", "Quality"],
        isFree: true,
    },
    {
        key: "qwen/qwen3-32b:free",
        name: "Qwen 3 32B Free",
        usecase: "Free, fast, high quality",
        provider: "OpenRouter",
        tags: ["Free", "Fast", "Quality"],
        isFree: true,
    },
    {
        "key": "deepseek/deepseek-chat-v3-0324:free",
        "name": "DeepSeek Chat V3",
        "usecase": "Free, fast, high quality",
        "provider": "OpenRouter",
        "tags": ["Free", "Fast", "Quality"],
        isFree: true,
        contextLength: 163840
    },
    {
        "key": "deepseek/deepseek-r1-0528:free",
        "name": "DeepSeek R1",
        "usecase": "Free, fast, high quality",
        "provider": "OpenRouter",
        "tags": ["Free", "Fast", "Quality"],
        isFree: true,
        contextLength: 163840
    },
    {
        key: "google/gemini-2.0-flash-exp:free",
        name: "Gemini Flash Exp Free",
        usecase: "Free, fast, high quality",
        provider: "OpenRouter",
        tags: ["Free", "Fast", "Quality"],
        contextLength: 1048576,
        isFree: true,
    },
    {
        "key": "minimax/minimax-m1",
        "name": "MiniMax M1",
        "usecase": "Open Weight Reasoning",
        "provider": "OpenRouter",
        "tags": ["Free", "Open Weight"],
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