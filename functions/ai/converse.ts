import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { convertToCoreMessages, LanguageModelV1, Message, streamObject, streamText } from "ai"; 

export default async function Converse(
    {
        messages, apiKey, system, model
    }
    :
    {
        messages: Message[];
        apiKey: string;
        system: string
        model: LanguageModelV1;
    }
) {

    const result = await streamText({
        model: model,
        system: system,
        messages: convertToCoreMessages(messages)
    })

    return result;
}