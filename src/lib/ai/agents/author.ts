import { generateObject } from "ai";
import { getLanguageModel } from ".."
import { z } from "zod";
import { TextModelId } from "../models/llm";

type Params = {
    prompt: string,
    modelId: TextModelId,
    apiKey?: string,
}

/**
 * Generates content based on a prompt using the specified AI model
 * @param params - Configuration object containing prompt, model ID, and optional API key
 * @returns Promise that resolves to the generated content string
 */
export async function Author(params: Params) {
    
    const model = await getLanguageModel({modelId: params.modelId, apiKey: params.apiKey }); 

    const { object: { result } } = await generateObject({
        model,
        schema: z.object({
            result: z.string().describe("The RAW generated text based on the prompt and input provided."),
        }),
        prompt: params.prompt
    })

    return result;

}