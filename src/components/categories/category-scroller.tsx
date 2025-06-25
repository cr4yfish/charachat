"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Category } from "@/lib/db/types/category";
import InfiniteSwiperLoader from "../swiper/infinite-swiper-loader";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import CategoryCardWithContext from "./category-card-with-context";
import { useCurrentCategory } from "@/hooks/use-current-category";
import ImageCharacterCard from "../character/character-card-image";
import { Skeleton } from "../ui/skeleton";
import { fetcher } from "@/lib/utils";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";
import useSWRInfinite from "swr/infinite";
import { LIMITS } from "@/lib/constants/limits";
import { Character } from "@/lib/db/types/character";

const limit = LIMITS.MAX_CHARACTERS_PER_PAGE;

type Props = {
    initialCategories: Category[];
    initialCharacters: Character[];
    currentCategory: Category;
}

const PureCategoryScroller = (props: Props) => {
    const { currentCategory, setCurrentCategory, categories } = useCurrentCategory(props.currentCategory);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { 
        data, 
        mutate,
        isLoading, isValidating,
        setSize
    } = useSWRInfinite<Character[]>(
        (pageIndex, prevPageData) => {
        if(prevPageData && !prevPageData.length) return null; // reached the end
        const cursor = pageIndex * limit;
        return API_ROUTES.GET_CHARACTERS_BY_CATEGORY + `?cursor=${cursor}&limit=${limit}` + (currentCategory ? `&categoryId=${currentCategory.id}` : '');
    }, 
    fetcher, {
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, // 1 hour
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        fallbackData: [props.initialCharacters],
        suspense: true,
        keepPreviousData: true,
    })

    const characters = useMemo(() => {
        return data ? data.flat() : [];
    }, [data])

    const handleScroll = useCallback(() => {
        if (containerRef.current && currentCategory) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                if(currentCategory) {
                    setSize(prevSize => prevSize + 1);
                } else {
                    console.error("Scroll container: Current category is not set");
                }
            };
            
        } else {
            console.error(containerRef.current, currentCategory);
        }
    }, [setSize, currentCategory]);

    // load more data on scrolling to end
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    useEffect(() => {
        if(categories) setCurrentCategory(categories[0]);
    }, [categories, setCurrentCategory])

    // reset characters when category changes
    useEffect(() => {
        mutate()
    }, [currentCategory, mutate])

    // Load more data until container has overflow
    // useEffect(() => {
    //     if(containerRef.current && categories) {
    //         const container = containerRef.current;
    //         if (!(container.scrollWidth > container.clientWidth)) {
    //             if(currentCategory && hasMore) {
    //                 handleLoadMore(currentCategory);
    //             }
    //         }
    //     }
    // }, [containerRef.current?.scrollWidth, categories, characters])

    return (
        <>
        <div className="flex flex-col gap-2 w-full relative">
            <h2 className="dark:prose-invert text-lg font-bold">Categories</h2>
        
            {categories && 
                <InfiniteSwiperLoader 
                    apiUrl={API_ROUTES.GET_CATEGORIES}
                    limit={LIMITS.MAX_CATEGORIES_PER_PAGE}
                    component={CategoryCardWithContext}
                    initialData={props.initialCategories}
                />
            }

            <div 
                className="overflow-x-auto w-full"
                ref={containerRef}
            >
                <div className="w-fit flex flex-row gap-4 pr-10 pb-4"  >
                    {characters?.map((char, index) => (
                        <ImageCharacterCard key={index} data={char} />
                    ))}
                    {(isLoading || isValidating) && (Array.from({ length: 15 }, (_, index) => index).map((_, index) => <Skeleton key={index} className='h-[150px] w-[310px] relative rounded-xl' />) )}
                    {characters?.length == 0 && !isLoading && !isValidating && 
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

const CategoryScroller = memo(PureCategoryScroller, (prevProps, nextProps) => {
    // Prevent re-render if the props are the same
    return (
        JSON.stringify(prevProps.initialCategories) === JSON.stringify(nextProps.initialCategories) &&
        JSON.stringify(prevProps.initialCharacters) === JSON.stringify(nextProps.initialCharacters) &&
        JSON.stringify(prevProps.currentCategory) === JSON.stringify(nextProps.currentCategory)
    );
});
export default CategoryScroller;