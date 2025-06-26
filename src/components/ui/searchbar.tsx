"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { SearchIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
    initialQuery: string;
    placeholder?: string;
}

const PureSearchBar = ({ initialQuery } : Props) => {
    const [isFocused, setIsFocused] = useState(false);
    const [input, setInput] = useState<string>(initialQuery || " ");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const searchBarRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    // update input state when initialQuery changes
    useEffect(() => {
        if(initialQuery) {
            setInput(initialQuery);
        }
    }, [initialQuery])

    // Load recent searches from local storage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedSearches = localStorage.getItem("recentSearches");
            if (storedSearches) {
                setRecentSearches(JSON.parse(storedSearches));
            }
        }
        // Cleanup function to reset state if needed
        return () => {
            setRecentSearches([]);
        };
    }, [])

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        if (isFocused) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFocused]);

    const searchLogic = (searchTerm: string) => {
        setIsFocused(false); // Close the search bar popover
        // Navigate to the search page with the clicked term
        const searchParams = new URLSearchParams();
        searchParams.set("q", searchTerm);
        searchParams.set("type", "characters"); // Default type, can be changed based on requirements
        router.push(`/search?${searchParams.toString()}`);
    }

    const handleSearch = (formData: FormData) => {
        const query = formData.get("search") as string;
        // save the query to local storage
        // "recentSearches" Array<string>
        const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        if (query && !recentSearches.includes(query)) {
            recentSearches.push(query);
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        } 
        
        searchLogic(query);
    };

    const handleRecentSearchClick = (searchTerm: string) => {
        // Save the clicked search term to local storage
        const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        if (!recentSearches.includes(searchTerm)) {
            recentSearches.push(searchTerm);
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
        }
        searchLogic(searchTerm);
    };

    const handleRemoveRecentSearch = (searchTerm: string) => {
        // Remove the search term from local storage
        const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        const updatedSearches = recentSearches.filter((term: string) => term !== searchTerm);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
        setRecentSearches(updatedSearches);
    }

    return (
        <Form action={handleSearch} className="relative z-50 w-full" ref={searchBarRef}>

            {/* Searchbar */}
            <div className="relative bg-slate-800/50 border border-border rounded-full w-full h-fit flex items-center justify-center backdrop-blur-lg ">
                <Button type="submit" className="absolute left-0 top-0 h-full flex items-center justify-center text-slate-200/80 ml-1" variant={"link"}>
                    <SearchIcon />
                </Button>
                <Input 
                    placeholder="Search"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="w-full bg-transparent pl-10 text-sm rounded-full"
                    name="search"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />
            </div>

            {/* Popover: recents, suggestions etc */}
            <div className={cn("absolute top-full left-0 w-full mt-2 overflow-hidden" , {
                "hidden": !isFocused
            })}>
                <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: isFocused ? 1 : 0, y: isFocused ? 0 : -5 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="p-4 bg-slate-800/60 rounded-3xl border border-border relative z-50 backdrop-blur-md "
                >
                    {/* Content goes here */}
                    {isFocused && (
                        <div >
                            <p className="text-xs text-muted-foreground">Recent Searches</p>
                            <ul>
                                {recentSearches.length > 0 ? (
                                    recentSearches.map((searchTerm, index) => (
                                        <li 
                                            key={index} 
                                            className="flex items-center justify-between py-1 hover:bg-slate-700 rounded cursor-pointer"
                                            onClick={() => handleRecentSearchClick(searchTerm)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <SearchIcon size={14} />
                                                <span className="text-sm">{searchTerm}</span>
                                            </div>
                                       
                                            <Button 
                                                variant="link" 
                                                className="text-xs text-muted-foreground " 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent triggering the search
                                                    handleRemoveRecentSearch(searchTerm);
                                                }}
                                            >
                                                <XIcon />
                                            </Button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-muted-foreground">No recent searches</li>
                                )}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </div>
        </Form>
    )
}

const SearchBar = memo(PureSearchBar, (prevProps, nextProps) => {
    // Only re-render if the onSearch prop changes
    if (prevProps.initialQuery !== nextProps.initialQuery) return false;

    return true;
});

export default SearchBar;