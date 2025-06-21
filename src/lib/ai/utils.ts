import { Profile } from "@/types/db";
import { LLM, LLMGroup, ModelId, ProviderId } from "./types";
import { LLMs } from "./models/llm/text-models";

/**
 * Retrieves the API key for a specific AI model provider from the user's profile or environment variables.
 * 
 * This function looks up the provider for the given model ID and attempts to find the corresponding
 * encrypted API key in the user's profile. For some providers like Groq and Mistral, it falls back
 * to public environment variables if no user key is found.
 * 
 * @param modelId - The unique identifier of the AI model to get the API key for
 * @param profile - The user profile containing encrypted API keys for various providers
 * @returns The encrypted API key for the provider, or undefined if no key is found
 * 
 * @example
 * ```typescript
 * const apiKey = getProviderAPIKey("gpt-4", userProfile);
 * if (apiKey) {
 *   // Use the API key for requests
 * }
 * ```
 */
export const getProviderAPIKey = (modelId: ModelId | string, profile: Profile): string | undefined => {
    const provider = LLMs.find(llm => llm.key === modelId)?.provider;

    switch(provider as ProviderId) {
        case "Groq":
            const key = profile.api_keys?.find(key => key.provider === "Groq")?.encrypted_api_key;
            if(key && key.length > 0) {
                return key;
            }
            return process.env.PUBLIC_GROQ_API_KEY; // fallback to free (rate-limited) Groq API key

        case "You":
            return profile.api_keys?.find(key => key.provider === "You")?.encrypted_api_key;
            
        case "OpenAI":
            return profile.api_keys?.find(key => key.provider === "OpenAI")?.encrypted_api_key;
        
        case "Gemini":
            return profile.api_keys?.find(key => key.provider === "Gemini")?.encrypted_api_key;

        case "Anthropic":
            return profile.api_keys?.find(key => key.provider === "Anthropic")?.encrypted_api_key;

        case "Cohere":
            return profile.api_keys?.find(key => key.provider === "Cohere")?.encrypted_api_key;

        case "xAI":
            const xaiKey = profile.api_keys?.find(key => key.provider === "xAI")?.encrypted_api_key;
            if(xaiKey && xaiKey.length > 0) {
            return xaiKey;
            }

        case "Mistral":
            const mistralKey = profile.api_keys?.find(key => key.provider === "Mistral")?.encrypted_api_key;
            if(mistralKey && mistralKey.length > 0) {
                return mistralKey;
            }
            return process.env.PUBLIC_MISTRAL_API_KEY; // fallback to free (rate-limited) Mistral API key

        case "OpenRouter":
            if(profile.api_keys?.find(key => key.provider === "OpenRouter")) {
                return profile.api_keys?.find(key => key.provider === "OpenRouter")?.encrypted_api_key;
            }
            return process.env.PUBLIC_OPENROUTER_API_KEY; // fallback to free (rate-limited) OpenRouter API key

        case "DeepSeek":
            return profile.api_keys?.find(key => key.provider === "DeepSeek")?.encrypted_api_key;

        default:
            return undefined;
    }
}

/**
 * Adjusts the temperature parameter for specific AI models that require custom temperature scaling.
 * 
 * Some AI models like DeepSeek have different temperature ranges or recommendations than the standard
 * 0-1 range. This function applies model-specific adjustments to ensure optimal performance.
 * 
 * @param modelId - The unique identifier of the AI model
 * @param temp - The base temperature value (typically 0-1)
 * @returns The adjusted temperature value for the specific model, or the original temperature if no adjustment is needed
 * 
 * @example
 * ```typescript
 * const adjustedTemp = getCustomTemperature("deepseek-chat", 0.8); // Returns 1.5
 * ```
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

/**
 * Checks if the user has valid API keys for image generation services.
 * 
 * Currently checks for Hugging Face API keys which are used for image generation capabilities.
 * 
 * @param profile - The user profile to check for image API keys
 * @returns True if the user has at least one valid image API key, false otherwise
 */

/**
 * Filters the available LLMs based on whether they are free or the user has valid API keys.
 * 
 * Returns a list of LLMs that the user can actually use - either because they're free models
 * or because the user has provided valid API keys for the required providers.
 * 
 * @deprecated
 * @param profile - Optional user profile containing API keys. If not provided, only free models are returned
 * @returns Array of LLM objects that are available to the user
 */
export const checkUserHasImageAPIKey = (profile: Profile): boolean => {
    if(profile.hf_encrypted_api_key || profile.hf_encrypted_api_key) {
        return true;
    }
    return false;
}

/**
 * Groups available LLMs by their provider and sorts them alphabetically.
 * 
 * Creates a structured list of LLM groups where each group contains all models from a specific
 * provider. Both the groups and the models within each group are sorted alphabetically.
 * 
 * @returns Array of LLMGroup objects, each containing a provider name and its associated LLMs
 */

export const LLMsWithAPIKeys = (profile?: Profile | undefined): LLM[] => {
    return LLMs.filter((llm) => {

        if(
            llm.isFree ||
            (profile && getProviderAPIKey(llm.key, profile)) 
        ) {
            return llm;
        }
    })
}

/**
 * Determines if an LLM is available for free use.
 * 
 * @param llm - The LLM object to check
 * @returns True if the LLM can be used without an API key, false otherwise
 */
export const getLLMGroupedByProvider = (profile?: Profile | undefined): LLMGroup[] => {
    const groups: LLMGroup[] = [];
    LLMsWithAPIKeys(profile).forEach((llm) => {
        const existingGroup = groups.find(group => group.provider === llm.provider);
        if (existingGroup) {
            existingGroup.llms.push(llm);
        } else {
            groups.push({ provider: llm.provider, llms: [llm] });
        }
    })
    // Sort groups by provider name
    groups.sort((a, b) => a.provider.localeCompare(b.provider));

    // Sort llms within each group by name
    groups.forEach(group => {
        group.llms.sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
}

/**
 * Checks if an LLM is free to use, meaning it does not require an API key for access.
 * 
 * @deprecated Just use `llm.isFree` instead
 * @param llm - The LLM object to check
 * @returns 
 */
export const isFreeLLM = (llm: LLM) => {
    return llm.isFree;
}

/**
 * Checks if an LLM supports tool/function calling capabilities.
 * 
 * @param llm - The LLM object to check for tool support
 * @returns True if the LLM supports tools/function calling, false otherwise
 */
export const llmSupportsTools = (llmOrId: LLM | ModelId): boolean => {
    let llm: LLM | undefined = llmOrId as LLM;
    if(typeof llmOrId === "string") {
        llm = getLLMById(llmOrId);
    }
    if(!llm || !llm.features) {
        return false;
    }
    return llm.features.includes("tools");
}

/**
 * Retrieves an LLM object by its unique identifier.
 * 
 * @param id - The unique model identifier to search for
 * @returns The LLM object if found, undefined otherwise
 */
export const getLLMById = (id: ModelId): LLM | undefined => {
    return LLMs.find((llm) => llm.key === id);
}
