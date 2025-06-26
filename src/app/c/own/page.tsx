/**
 * Dedicated page for browsing own characters.
 * This will be a paginated grid of characters that the user has created.
 */

import { getUserCharacters } from "@/lib/db/character";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { LIMITS } from "@/lib/constants/limits";
import SmallCharacterCard from "@/components/character/character-card-small";

export default async function OwnCharsPage({ searchParams }: { searchParams: Promise<{ page?: string | undefined }>}) {
    const { page = "1" } = await searchParams;

    const requestedPage =  parseInt(page, 10) || 1; // Ensure page is a number, default to 1 if not provided
    const calculatedCursor = (requestedPage - 1) * LIMITS.MAX_CHARACTERS_PAGINATION; // Calculate cursor based on page number

    const nextPage = requestedPage + 1; // Calculate next page number for pagination
    const prevPage = requestedPage > 1 ? requestedPage - 1 : null; // Calculate previous page number, if applicable

    const chars = await getUserCharacters({
        cursor:  calculatedCursor,
        limit: LIMITS.MAX_CHARACTERS_PAGINATION // Adjust the limit as needed
    });

    const hasMore = chars.length === LIMITS.MAX_CHARACTERS_PAGINATION; // Check if there are more characters to load

    return (
        <div className=" w-full h-fit ios-safe-header-padding-chats px-4 flex flex-col gap-4">
            
            {chars.map((char) => (
                <SmallCharacterCard
                    key={char.id}
                    data={char}
                    hasLink={true}
                />
            ))}
            <Pagination>
                <PaginationContent>

                    {/* Show previous page if it exists */}
                    {requestedPage > 1 &&
                    <>
                        <PaginationItem>
                            <PaginationPrevious href={"/c/own?page=" + prevPage} />
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationLink href={"/c/own?page=" + prevPage}>{prevPage}</PaginationLink>
                        </PaginationItem>
                        
                    </>
                    }

                    {/* Show current page if there's a prev or next one */}
                    {(requestedPage > 1 || hasMore) &&
                        <PaginationItem>
                            <PaginationLink href="#">{requestedPage}</PaginationLink>
                        </PaginationItem>
                    }

                    {/* Show next pages if there are more pages */}
                    {hasMore && 
                    <>
                        <PaginationItem>
                            <PaginationLink href={"/c/own?page=" + nextPage}>{nextPage}</PaginationLink>
                        </PaginationItem>

                        <PaginationItem>
                            <PaginationNext href={"/c/own?page=" + nextPage} />
                        </PaginationItem>
                    </>
                    }

                </PaginationContent>
            </Pagination>
        </div>
    )
}