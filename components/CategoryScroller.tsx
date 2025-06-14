"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Category, Character } from "@/types/db";
import { getCharactersByCategory } from "@/functions/db/character";
import CharacterCard from "./character/CharacterCard";
import InfiniteSwiperLoader from "./InfiniteSwiperLoder";
import { getCategories } from "@/functions/db/categories";
import { useCurrentCategory } from "@/context/CurrentCategoryProvider";
import CategoryCardWithContext from "./character/CategoryCardWithContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

type Props = {
    categories: Category[]
}

const limit = 4;

export default function CategoryScroller(props: Props) {
    const { currentCategory, setCurrentCategory } = useCurrentCategory();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const { toast } = useToast();

    const handleLoadMore = useCallback(async (category: Category) => {
        if(isLoading) return;
        setIsLoading(true)

        try {
            const res = await getCharactersByCategory({ cursor: characters?.length ?? 0, limit, args: { categoryId: category.id } } );   
            if(characters) {
                setCharacters([...characters, ...res]);
            } else {
                setCharacters(res);
            }

            if(res.length < limit) {
                setHasMore(false);
            }

        } catch(error) {
            const err = error as Error;
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        }
        
        setIsLoading(false);
    }, [characters]);

    const handleScroll = useCallback(() => {
        if (containerRef.current && currentCategory) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                if(currentCategory && hasMore) {
                    handleLoadMore(currentCategory);
                } else {
                    console.error("Scroll container: Current category is not set");
                }
            };
            
        } else {
            console.error(containerRef.current, currentCategory);
        }
    }, [currentCategory, handleLoadMore]);

    // load more data on scrolling to end
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        setCurrentCategory(props.categories[0]);
    }, [props.categories, setCurrentCategory])

    useEffect(() => {
        setHasMore(true);
        setCharacters([]);
    }, [currentCategory])

    // Load more data until container has overflow
    useEffect(() => {
        if(containerRef.current && props.categories) {
            const container = containerRef.current;
            if (!(container.scrollWidth > container.clientWidth)) {
                if(currentCategory && hasMore) {
                    handleLoadMore(currentCategory);
                }
            }
        }
    }, [containerRef.current?.scrollWidth, props.categories, characters])

    return (
        <>
        <div className="flex flex-col gap-2 w-full relative">
            <h2 className="dark:prose-invert text-lg font-bold">Categories</h2>
        
            <InfiniteSwiperLoader 
                loadMore={getCategories}
                limit={15}
                initialData={props.categories}
                component={CategoryCardWithContext}
            />

            <div 
                className="overflow-x-auto w-full"
                ref={containerRef}
            >
                <div className="w-fit flex flex-row gap-4 pr-10 pb-4"  >
                    {characters.map((char, index) => (
                        <CharacterCard key={index} data={char} hasLink />
                    ))}
                    {isLoading && (Array.from({ length: 15 }, (_, index) => index).map((_, index) => <Skeleton key={index} className='h-[150px] w-[310px] relative rounded-xl' />) )}
                    {characters.length == 0 && !isLoading &&
                        <div>
                            <p>No characters found in this category</p>
                        </div>
                    }
                </div>
            </div>
        </div>
            
        </>
    )

}