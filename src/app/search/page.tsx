
import SearchBar from "@/components/ui/searchbar";
import { unstable_cache } from "next/cache";
import { getCharacters, searchCharactersByAITags } from "@/lib/db/character";
import { TIMINGS } from "@/lib/constants/timings";
import SmallCharacterCard from "@/components/character/character-card-small";
import { SearchCategories } from "@/components/search/search-categories";
import { getLanguageModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { redirect } from "next/navigation";
import { LIMITS } from "@/lib/constants/limits";

export type SearchType = "characters" | "creators";
export type SortType = "likes" | "newest" | "popular" | "relevance";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string, type?: SearchType, sort?: SortType, page?: string }>;
    }) {
    const { q="", type="characters", sort="relevance", page="0" } = await searchParams;
    // Let mistral create keywords for the search
    // If the query is empty, we can return early
    let splittedTags: string[] = [];
    const startTime = performance.now();

    const currentPage = parseInt(page, 10);

    // Helper function to build pagination URLs while preserving search params
    const buildPaginationUrl = (pageNum: number) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (type !== 'characters') params.set('type', type);
        if (sort !== 'relevance') params.set('sort', sort);
        params.set('page', pageNum.toString());
        return `/search?${params.toString()}`;
    };

    if( isNaN(currentPage) || currentPage < 0) {
        redirect("/search");
    }

    const limit = LIMITS.MAX_CHARACTERS_PAGINATION; // Number of results per page
    const cursor = currentPage* limit; // Calculate cursor based on page number

    try {
        const mistral = await getLanguageModel({ modelId: "ministral-3b-latest", apiKey: process.env.SEARCH_MISTRAL_API_KEY })

        const { object: { tags } } = await generateObject({
            model: mistral,
            schema: z.object({
                tags: z.string().describe("A list of tags to search for, separated by commas. Example: 'tag1, tag2, tag3'"),
                suggestedTags: z.string().describe("A different list of suggested tags to use for the filtering the tags, separated by commas. Should be more like categories. Example: 'roleplay, fantasy, sci-fi'"),
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

    const searchResults = splittedTags.length > 0 ? 
        // if there are tags -> search
        await unstable_cache(
            async () => {
                if (!q) return [];
                if (type === "characters") {
                    return searchCharactersByAITags(splittedTags, { sort: sort, includeNSFW: true });
                }
                // Add other search types as needed
                return [];
            }, 
            ["search", q, sort, type],
            {
                tags: ["search", sort, type],
                revalidate: TIMINGS.ONE_HOUR // Cache for 1 hour
            }
        )() 
    
    : 
        // if no tags -> let user browse all characters
        await unstable_cache(
            async () => {
                if (type === "characters") {
                    return getCharacters({ cursor, limit  }, sort);
                }
                // Add other search types as needed
                return [];
            },
            [`browse-cursor-${cursor}-${sort}`],
            {
                tags: [`browse-cursor-${cursor}-${sort}`],
                revalidate: TIMINGS.ONE_HOUR // Cache for 1 hour
            }
        )();

    const hasNextPage = searchResults.length === limit;
    const hasPreviousPage = currentPage > 0;
    const endTime = performance.now();
    const searchTime = ((endTime - startTime) / 1000).toFixed(3);

    return (
        <div className="px-4 flex flex-col gap-4 relative h-full w-full overflow-hidden">
            <div className="flex flex-col absolute top-[70px] left-0 w-full h-fit z-50 p-4 pt-0">
               <SearchBar initialQuery={q} /> 
               <SearchCategories initType={type} initSortType={sort} currentQuery={q} />
            </div>

            <div className="max-h-screen overflow-y-auto overflow-x-hidden pt-[180px] pb-[100px]">
                <div className="h-fit w-full flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                        <span>Found {searchResults.length} characters in {searchTime} seconds</span>
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
                <Pagination className="mt-4">

                    <PaginationContent className="text-muted-foreground">

                        {hasPreviousPage && 
                        <>
                  

                            <PaginationItem>
                                <PaginationPrevious href={buildPaginationUrl(currentPage-1)} />
                            </PaginationItem>  

                            { (currentPage > 1) &&
                                <PaginationItem>
                                    <PaginationLink href={buildPaginationUrl(currentPage-2)}>{currentPage-1}</PaginationLink>
                                </PaginationItem>
                            }

                            <PaginationItem>
                                <PaginationLink href={buildPaginationUrl(currentPage-1)}>{currentPage}</PaginationLink>
                            </PaginationItem>

                        </>
                        }
                        
                        <PaginationItem>
                            <PaginationLink className="text-white/90" href="#">{currentPage+1}</PaginationLink>
                        </PaginationItem>


                        {hasNextPage &&
                        <>

                            <PaginationItem>
                                <PaginationLink href={buildPaginationUrl(currentPage+1)}>{currentPage+2}</PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext href={buildPaginationUrl(currentPage+1)} />
                            </PaginationItem>


                        </>
                        }

                    </PaginationContent>
                    
                </Pagination>
            </div>
            
        </div>
    )
}