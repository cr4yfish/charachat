"use client";

import CharacterCard from "@/components/character/CharacterCard";
import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";
import { searchCharactersInfinite } from "@/functions/db/character";
import { Character } from "@/types/db";
import { Input } from "@nextui-org/input";
import { Spinner } from "@nextui-org/spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const _LIMIT = 30;

type OverwriteSearchProps = {
    search?: string;
    sort?: string;
    cursor?: number;
}

export default function Page() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("created_at");
    const [loading, setLoading] = useState(false);
    const [characters, setCharacters] = useState<Character[]>([]);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const [hasMore, setHasMore] = useState(true);

    const handleSearch = useCallback(async (props: OverwriteSearchProps) => {
        if(loading || !hasMore) return;
        setLoading(true);
        const newChars = await searchCharactersInfinite({ cursor: props.cursor ?? characters.length, limit: _LIMIT, args: { search: props.search ?? search,  sort: props.sort ?? sort } });
        if(newChars.length < _LIMIT) {
            setHasMore(false);
        }
        console.log(newChars)
        
        const noDupes = newChars.filter(newChar => !characters.find(char => char.id == newChar.id));

        setCharacters(prev => [...prev, ...noDupes]);
        setLoading(false);
    }, [search, sort, loading, hasMore, characters]);

    useEffect(() => {
        if(searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setCharacters([])
            setHasMore(true)
            if(search.length == 0) {
                setCharacters([]);
            } else {
                handleSearch({ cursor: 0 });
            }
        }, 500);

        return () => {
            if(searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        }

    }, [search])

    const handleSort = async (newSort: string) => {
        setSort(newSort);
        setCharacters([]);
        setHasMore(true);
        handleSearch({ sort: newSort });
    }

    return (
        <>
        <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
            <h1 className="text-xl font-bold">Search Charachat</h1>
            <form 
                className="w-full flex flex-col items-center justify-center max-w-lg gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch({});
                }}
            >
                <Input 
                    label="Search" 
                    value={search}
                    onValueChange={setSearch}
                    startContent={<Icon>search</Icon>} 
                    endContent={
                        <Button 
                            isLoading={loading} 
                            radius="full" 
                            isIconOnly 
                            type="submit"
                            color="primary">
                                <Icon>send</Icon>
                        </Button>
                    }
                />

                <div className="flex flex-row items-center gap-2 overflow-x-auto w-full relative">
                    <Select disabled>
                        <SelectTrigger className="w-[180px]">
                            <Icon>filter_list</Icon>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="characters">Characters</SelectItem>
                            <SelectItem value="stories">Stories</SelectItem>
                            <SelectItem value="personas">Personas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue={"created_at"} onValueChange={handleSort}>
                        <SelectTrigger className="w-[180px]">
                            <Icon>sort</Icon>
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="chats">Chats</SelectItem>
                            <SelectItem value="likes">Likes</SelectItem>
                            <SelectItem value="name">Alphabetically</SelectItem>
                            <SelectItem value="created_at">Date</SelectItem>
                        </SelectContent>
                    </Select>

                </div>

            </form>
            <div className="flex flex-row gap-2 w-full h-full overflow-x-auto overflow-y-auto">

                <InfiniteScroll 
                    pageStart={0}
                    initialLoad={false}
                    loadMore={async () => await handleSearch({})}
                    hasMore={hasMore}
                    loader={<div key={"spinner"}>{loading && <Spinner />}</div>}
                    useWindow={false}
                    className="flex flex-row flex-wrap justify-center gap-2 w-full h-fit"
                >
                    {characters.map((character, index) => (
                        <CharacterCard key={index} data={character} hasLink />
                    ))}
                </InfiniteScroll>

            </div>
        </div>
        </>
    )
}