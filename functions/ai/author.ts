/* eslint-disable @typescript-eslint/no-explicit-any */

import { CoreTool, generateText, GenerateTextResult, streamText, StreamTextResult } from "ai";
import { Profile } from "@/types/db"
import { getLanguageModel, getModelApiKey } from "./llm";

type AuthorProps = {
    profile: Profile,
    systemText: string,
    prompt: string
}



export async function author({ profile, systemText, prompt }: AuthorProps) {

    const result = await streamText({
        system: systemText,
        prompt: prompt,
        model: await getLanguageModel({
            modelId: profile.default_llm,
            apiKey: await getModelApiKey(profile),
        }),
    })

    return result as StreamTextResult<Record<string, CoreTool<any, any>>>;

}

export async function authorNoStream({ profile, systemText, prompt }: AuthorProps) {
    const result = await generateText({
        system: systemText,
        prompt: prompt,
        model: await getLanguageModel({
            modelId: profile.default_llm,
            apiKey: await getModelApiKey(profile),
        }),
    })   
    return result as GenerateTextResult<Record<string, CoreTool<any, any>>>;
}