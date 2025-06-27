/**
 * Persona Carousel with Searchbar that uses SearchPersonasWithAITags
 * 
 */

"use client";

import { Persona } from "@/lib/db/types/persona";
import PersonaImageCard from "./persona-image-card";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { fetcher } from "@/lib/utils";
import { memo, useState } from "react";
import { useDebounce } from "use-debounce";
import SearchBarMinmal from "../ui/searchbar-minimal";

type Props = {
    onClick: (persona: Persona) => void;
}

const PurePersonaSelector = ({ onClick }: Props) => {
    const [query, setQuery] = useState<string>("");
    const [debouncedQuery] = useDebounce(query.trim(), 300);
    
    // Use different endpoints based on whether there's a search query
    // When no search query, fetch all personas; when searching, use search endpoint
    const apiUrl = debouncedQuery 
        ? API_ROUTES.SEARCH_PERSONAS + encodeURIComponent(debouncedQuery) + `&include_private=true`
        : API_ROUTES.GET_PERSONAS;
    
    const { data: personas, isLoading } = useSWR<Persona[]>(apiUrl, fetcher);

    return (
        <div id="persona-selector" className="flex flex-col gap-4 size-full">
            
            <div className="flex flex-col gap-2">
                <SearchBarMinmal 
                    placeholder="Search Personas..."
                    onChange={setQuery}
                />
                {query !== debouncedQuery && (
                    <div className="text-xs text-muted-foreground mt-1">Searching...</div>
                )}
            </div>

            <div className="flex flex-row gap-2 overflow-x-auto w-full">
                {isLoading && (
                    <div className="flex items-center justify-center w-full py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
                
                {!isLoading && personas?.map((persona) => (
                    <PersonaImageCard
                        key={persona.id}
                        data={persona}
                        hasLink={false}
                        onClick={() => onClick(persona)}
                    />
                ))}
                
                {!isLoading && personas?.length === 0 && (
                    <div className="flex items-center justify-center w-full py-8 text-muted-foreground">
                        {debouncedQuery ? 'No personas found matching your search.' : 'No personas available.'}
                    </div>
                )}
            </div>
        </div>
    )
}

const PersonaSelector = memo(PurePersonaSelector, (prevProps, nextProps) => {
    // Prevent re-render if the onClick function is the same
    if (prevProps.onClick !== nextProps.onClick) return false;

    return true;
});

export default PersonaSelector;