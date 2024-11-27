/* eslint-disable @typescript-eslint/no-explicit-any */

import { CoreTool, generateText, GenerateTextResult, streamText, StreamTextResult } from "ai";
import { Profile } from "@/types/db";
import { cookies } from "next/headers";

import { getLanguageModel } from "./llm";
import { getProfileAPIKey, isFreeModel, isPaidModel, ModelId } from "@/lib/ai";
import { decryptMessage } from "@/lib/crypto";
import { getUserTier } from "../db/profiles";

type AuthorProps = {
    profile: Profile,
    systemText: string,
    prompt: string,
    noStream?: boolean
}

export async function author({ profile, systemText, prompt, noStream }: AuthorProps) {

    const cookiesStore = cookies();

    // Generate the story field in a Story
    // based on Title and Description
    const key = cookiesStore.get("key")?.value;

    if(!key) {
        throw new Error("No key cookie");
    }

    let decryptedAPIKey: string | undefined = undefined;
    const encryptedAPIKey = getProfileAPIKey(profile.default_llm as ModelId, profile);
    if(!encryptedAPIKey && !isFreeModel(profile.default_llm as ModelId)) {
        throw new Error("No API key found");
    } else if(encryptedAPIKey) {
        decryptedAPIKey = decryptMessage(encryptedAPIKey, Buffer.from(key, 'hex'));
    }

    if(isPaidModel(profile.default_llm as ModelId)) {
        // check if user has access to this model
        const tier = await getUserTier(profile.user);
        if(tier !== 1) { throw new Error("You do not have access to this model"); }
    }
  
    if(noStream) {
        const result = await generateText({
            system: systemText,
            prompt: prompt,
            model: await getLanguageModel({
                modelId: profile.default_llm,
                apiKey: decryptedAPIKey,
            }),
        })   
        return result as GenerateTextResult<Record<string, CoreTool<any, any>>>;
    }

    const result = await streamText({
        system: systemText,
        prompt: prompt,
        model: await getLanguageModel({
            modelId: profile.default_llm,
            apiKey: decryptedAPIKey,
        }),
    })

    return result as StreamTextResult<Record<string, CoreTool<any, any>>>;
}