
import SearchBar from "@/components/ui/searchbar";
import { unstable_cache } from "next/cache";
import { searchCharactersByAITags } from "@/lib/db/character";
import { TIMINGS } from "@/lib/timings";
import SmallCharacterCard from "@/components/character/character-card-small";
import { SearchCategories } from "@/components/search/search-categories";
import { getLanguageModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";

export type SearchType = "characters" | "creators";
export type SortType = "likes" | "newest" | "popular" | "relevance";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string, type?: SearchType, sort?: SortType }>;
    }) {
    const { q="", type="characters", sort="relevance" } = await searchParams;
    // Let mistral create keywords for the search
    // If the query is empty, we can return early
    let splittedTags: string[] = [];
    const startTime = performance.now();

    try {
        const mistral = await getLanguageModel({ modelId: "ministral-3b-latest", apiKey: process.env.PUBLIC_SEARCH_MISTRAL_API_KEY })

        const { object: { tags } } = await generateObject({
            model: mistral,
            schema: z.object({
                tags: z.string().describe("A list of tags to search for, separated by commas. Example: 'tag1, tag2, tag3'"),
            }),
            prompt: `You are a helpful AI assistant. Given the search query "${q}", generate a list of tags that can be used to search for characters in a database. The tags should be relevant to the query and separated by spaces. The user could be searching in natural language. Use your knowledge of characters and their attributes to generate these tags. If the query is empty, return an empty list.`,
            maxTokens: 100,
            temperature: 0.5,
        });
        
        splittedTags = tags.split(",").filter(tag => tag.trim() !== "");
    } catch {
        console.error("Failed to generate search tags using Mistral, falling back to original query.");
        // Fallback: use the original query as tags
        splittedTags = q.split(" ").filter(tag => tag.trim() !== "");
    }

    const searchResults = splittedTags.length > 0 ? await unstable_cache(
        async () => {
            if (!q) return [];
            if (type === "characters") {
                return searchCharactersByAITags(splittedTags, { sort: "relevance", includeNSFW: true });
            }
            // Add other search types as needed
            return [];
        }, 
        ["search", q, sort, type],
        {
            tags: ["search", sort, type],
            revalidate: TIMINGS.ONE_HOUR // Cache for 1 hour
        }
    )() : [];

    const endTime = performance.now();
    const searchTime = ((endTime - startTime) / 1000).toFixed(5);

    return (
        <div className="px-4 flex flex-col gap-4 relative h-full w-full overflow-hidden">
            <div className="flex flex-col absolute top-[70px] left-0 w-full h-fit z-50 p-4 pt-0">
               <SearchBar initialQuery={q} /> 

               <SearchCategories initType={type} initSortType={sort} currentQuery={q} />
            </div>
            

            <div className="max-h-screen overflow-y-auto overflow-x-hidden pt-[180px] pb-[100px]">
                <div className="h-fit w-full flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                        <span>Used AI to find {searchResults.length} characters in {searchTime} seconds</span>
                        {splittedTags.length > 0 && (
                            <span>
                                (AI generated Tags: {splittedTags.map((tag, index) => (
                                    <span key={tag}>
                                        <span className="font-semibold">{tag}</span>
                                        {index < splittedTags.length - 1 && ", "}
                                    </span>
                                ))})
                            </span>
                        )}
                    </div>

                    {searchResults.length > 0 ? (
                        searchResults.map(character => (
                            <SmallCharacterCard
                                key={character.id}
                                data={character}
                                hasLink
                            />
                        ))
                    ) : (
                        <div className="text-center text-slate-400">
                            {q ? <>No results found for <span className="font-semibold">{q}</span></> : null}
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    )
}