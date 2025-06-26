import "server-only";
import { getLanguageModel } from "..";
import { generateObject } from "ai";
import { unstable_cache } from "next/cache";
import { searchCharactersByAITags } from "@/lib/db/character";
import { z } from "zod";
import { TIMINGS } from "@/lib/constants/timings";
import { Character } from "@/lib/db/types/character";
import { Profile } from "@/lib/db/types/profile";

type Params = {
    query: string;
    type: "characters" | "creators";
    sort: "likes" | "newest" | "popular" | "relevance";
    page?: number;
}

export default async function searchCharactersWithAIAgent(params: Params): Promise<Array<Character | Profile>> {
    const mistral = await getLanguageModel({ modelId: "ministral-3b-latest", apiKey: process.env.SEARCH_MISTRAL_API_KEY })

    const { object: { tags } } = await generateObject({
        model: mistral,
        schema: z.object({
            tags: z.string().describe("A list of tags to search for, separated by commas. Example: 'tag1, tag2, tag3'"),
            suggestedTags: z.string().describe("A different list of suggested tags to use for the filtering the tags, separated by commas. Should be more like categories. Example: 'roleplay, fantasy, sci-fi'"),
        }),
        prompt: `You are a helpful AI assistant. Given the search query "${params.query}", generate a list of tags that can be used to search for characters in a database. The tags should be relevant to the query and separated by spaces. The user could be searching in natural language. Use your knowledge of characters and their attributes to generate these tags. If the query is empty, return an empty list.`,
        maxTokens: 100,
        temperature: 0.5,
    });
    
    const splittedTags: string[] = tags.split(",").filter(tag => tag.trim() !== "");

    const result = await unstable_cache(
        async () => {
            if (params.type === "characters") {
                return searchCharactersByAITags(splittedTags, { sort: params.sort, includeNSFW: true });
            }
            // Add other search types as needed
            return [];
        }, 
        ["search", params.query, params.sort, params.type],
        {
            tags: ["search", params.sort, params.type],
            revalidate: TIMINGS.ONE_HOUR // Cache for 1 hour
        }
    )() 

    return result;

}