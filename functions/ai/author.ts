
import { streamText } from "ai";
import { Profile } from "@/types/db";
import { cookies } from "next/headers";

import { getLanguageModel } from "./llm";
import { getProfileAPIKey } from "@/lib/ai";
import { decryptMessage } from "@/lib/crypto";

type AuthorProps = {
    profile: Profile,
    systemText: string,
    prompt: string,
}

export async function author({ profile, systemText, prompt }: AuthorProps) {

    const cookiesStore = cookies();

    // Generate the story field in a Story
    // based on Title and Description
    const key = cookiesStore.get("key")?.value;

    if(!key) {
        throw new Error("No key cookie");
    }

    const encryptedAPIKey = getProfileAPIKey(profile.default_llm, profile);
    if(!encryptedAPIKey) {
        throw new Error("No API key found");
    }

    const decryptedAPIKey = decryptMessage(encryptedAPIKey, Buffer.from(key, 'hex'));

    const result = await streamText({
        system: systemText,
        prompt: prompt,
        model: await getLanguageModel({
            modelId: profile.default_llm,
            apiKey: decryptedAPIKey,
        }),
    })

    return result;
}