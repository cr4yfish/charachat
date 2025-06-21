/**
 * Functions to generate suggestions for chat messages (for the user)
 * based on the chat context.
 */

import { Character, Chat, Message, Profile } from "@/types/db";
import { getLanguageModel, getModelApiKey } from ".";
import { generateObject } from "ai";
import { z } from "zod";
import { getSuggestionsPrompt } from "./prompts";
import { ModelId } from "./types";

export type Suggestion = {
    title: string;
    content: string;
}

type GenerateSuggestionsProps = {
    chat: Chat;
    recentMessages?: Message[];
    userProfile: Profile | undefined;
    character?: Character | undefined;
}

const suggestionSchema = z.object({
    title: z.string().describe("The title of the suggestion, which should be a concise and engaging topic or question."),
    content: z.string().describe("The content of the Message you suggest. Out of the user's perspective. Speak directly to the character, as if you were the user."),
})

export async function generateSuggestions({ chat, recentMessages, userProfile: profile, character }: GenerateSuggestionsProps): Promise<Suggestion[]> {

    if (!profile) {
        throw new Error("User profile is required to generate suggestions.");
    }

    const apiKey = await getModelApiKey(profile, chat.llm as ModelId);
    const model = await getLanguageModel({ modelId: chat.llm, apiKey })

    const prompt = getSuggestionsPrompt({
        profile, character,recentMessages,
    });

    const { object } = await generateObject({
        model,
        schema: z.object({
            suggestions: z.array(suggestionSchema).length(3).describe("A list of suggestions for the user to continue the conversation or explore new topics."),
        }),
        prompt,
    })

    if (!object || !object.suggestions) {
        return [];
    }

    return object.suggestions;
}