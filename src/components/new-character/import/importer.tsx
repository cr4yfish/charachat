"use client";

import { memo, useCallback, useState } from "react";
import { ImportSearch } from "./import-search";
import { ImporterSearchResults } from "./importer-search-results";
import { ChevronLeftIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type ImportCharType = {
    sourceId?: string; // Optional source ID for tracking
    name: string;
    description?: string;
    imageLink?: string;
    tags?: string[];
    source?: string;
    nsfw?: boolean;
}

type Props<T = unknown> = {
    searchAction: (search: string) => Promise<T[]>;
    label: string;
}
const PureImporter = ({ label, searchAction }: Props) => {
    const [searchResults, setSearchResults] = useState<ImportCharType[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async (search: string) => {
        setLoading(true);
        try {
            const results = await searchAction(search);
            if (!results) {
                setSearchResults([]);
                return;
            }
      
            setSearchResults(results as ImportCharType[]);
            
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setLoading(false);
        }
    }, [searchAction]);

    return (
        <>
        <div className="fixed top-0 left-0 w-full h-[75px] bg-gradient-to-b from-background/80 to-background/80 z-50">
            <div className="relative size-full px-4 py-2 flex items-center justify-start">
                <Link href={"/c/new"}>
                    <Button variant={"ghost"}><ChevronLeftIcon /></Button>
                </Link>
                <span className="text-3xl font-black">{label}</span>
            </div>
            <div className="absolute top-0 left-0 -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>
        </div>
        <div className="flex flex-col gap-2 h-full relative overflow-hidden max-h-full">
            <div className="absolute top-[75px] left-0 w-full bg-gradient-to-b from-background/80 to-background/0 px-4 backdrop-blur-[1px] z-50">
                <ImportSearch 
                    onSearchChange={handleSearch}
                    label="Search for a character"
                    placeholder="Type a character name..."
                />
            </div>

            
            <ImporterSearchResults searchResults={searchResults} />
            {loading && <div className="mt-[75px] w-full flex justify-center animate-spin text-muted-foreground ">
                <LoaderCircleIcon />
            </div>}
    
        </div>
        </>
    )
}

export const Importer = memo(PureImporter, (prevProps, nextProps) => {
    // Only re-render if the searchAction or onCharacterSelected changes
    return prevProps.searchAction === nextProps.searchAction;
});