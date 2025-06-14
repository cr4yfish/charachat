"use client";

import { motion, AnimatePresence } from "motion/react";
import Icon from "./utils/Icon";
import React from "react";
import { Character, Story } from "@/types/db";
import { searchCharacters } from "@/functions/db/character";
import { searchStories } from "@/functions/db/stories";
import dynamic from "next/dynamic";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";

const SearchResult = dynamic(() => import("./SearchResult"), { ssr: false });

export default function Searchbar() {

    const [search, setSearch] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const [characters, setCharacters] = React.useState<Character[]>([]);
    const [stories, setStories] = React.useState<Story[]>([]);
    const [hasResults, setHasResults] = React.useState<boolean>(false);
    const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const handleSearch = async () => {
            // fetch the data from the server
            setLoading(true);

            const charactersRes = await searchCharacters(search);
            setCharacters(charactersRes);
    
            const storiesRes = await searchStories(search);
            setStories(storiesRes);

            if(charactersRes.length > 0 || storiesRes.length > 0) {
                setHasResults(true);
            }
            setHasResults(true);
            setLoading(false);
        }

        if(searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            if(search.length == 0) {
                // reset results
                setCharacters([]);
                setStories([]);
                setHasResults(false);
            } else {
                handleSearch();
            }
           
        }, 500);

        return () => {
            if(searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        }

    }, [search])

    return (
        <>
        <div className="flex justify-end relative h-fit w-full overflow-visible">
            <div className="relative w-full max-w-lg flex flex-col gap-4 ">
                <Input 
                    placeholder="Search Characters and Stories" 
                    value={search}
                    onValueChange={setSearch}
                />
                
                <AnimatePresence>
                { hasResults &&
                <motion.div 
                    className={`
                        z-40 w-full h-fit dark:bg-zinc-800/80 backdrop-blur-xl px-4 py-3 border border-zinc-300 dark:border-zinc-600
                        rounded-lg absolute top-[130%] left-0 flex flex-col gap-2 max-h-[50svh] overflow-y-auto
                    `}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                >
                    <div className="h-full w-full">
                        {characters.length > 0 &&
                        <div className="flex flex-col gap-2 overflow-x-hidden w-full h-full">
                            <span className="text-md font-bold">Characters</span>
                            <div className="flex flex-col relative overflow-x-auto">
                                {characters.map((character) => (
                                    <SearchResult 
                                        key={character.id} 
                                        link={`/c/${character.id}`}
                                        title={character.name}
                                        description={character.description}
                                        imageLink={character.image_link ?? ""}
                                        owner={character.owner?.username}
                                    />
                                ))}
                            </div>
                        </div>
                        }
                        
                        {stories.length > 0 &&
                        <div className="flex flex-col gap-2 overflow-x-hidden w-full h-full">
                            <span className="text-md font-bold">Stories</span>
                            <div className="flex flex-col relative overflow-x-auto">
                                {stories.map((story) => (
                                    <SearchResult 
                                        key={story.id} 
                                        link={`/c/${story.character.id}/story/${story.id}`}
                                        title={story.title}
                                        description={story.description}
                                        imageLink={story.image_link ?? ""}
                                        owner={story.creator.username}
                                    />
                                ))}
                            </div>
                        </div>
                        }
                    </div>

                    {(characters.length == 0 && characters.length == 0) && 
                    <div className="flex flex-col items-center justify-center w-full h-fit">
                        <span className="text-sm dark:text-zinc-400">No search results</span>
                    </div>
                    }
                </motion.div>
                }
                </AnimatePresence>
            
            </div>
        </div>
        </>
    )
}