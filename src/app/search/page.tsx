
import SearchBar from "@/components/ui/searchbar";
import { unstable_cache } from "next/cache";
import { searchCharacters } from "@/lib/db/character";
import { TIMINGS } from "@/lib/timings";
import SmallCharacterCard from "@/components/character/character-card-small";
import { SearchCategories } from "@/components/search/search-categories";

export type SearchType = "characters" | "creators";
export type SortType = "likes" | "newest" | "popular" | "relevance";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string, type?: SearchType, sort?: SortType }>;
}) {
    const { q="", type="characters", sort="relevance" } = await searchParams;

    const searchResults = q ? await unstable_cache(
        async () => {
            if (!q) return [];
            if (type === "characters") {
                return searchCharacters(q, sort);
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

    return (
        <div className="px-4 flex flex-col gap-4 relative h-full w-full">
            <div className="flex flex-col fixed top-[70px] left-0 w-full h-fit z-50 p-4 pt-0">
               <SearchBar initialQuery={q} /> 

               <SearchCategories initType={type} initSortType={sort} currentQuery={q} />
            </div>
            

            <div className="max-h-screen overflow-y-auto overflow-x-hidden pt-[180px] pb-[100px]">
                <div className="h-fit w-full flex flex-col items-center justify-center gap-2">
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
                            No results found for <span className="font-semibold">{q}</span>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    )
}