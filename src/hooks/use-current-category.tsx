"use client";

import React from "react";
import { Category } from "@/types/db";
import { createContext, useContext, useState, ReactNode } from "react";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";

interface CategoryContextProps {
    currentCategory: Category | null;
    setCurrentCategory: (category: Category) => void;
    categories: Category[] | undefined;
}

const CurrentCategoryProviderContext = createContext<CategoryContextProps | null>(null);

export const CurrentCategoryProvider = ({ children } : { children: ReactNode }) => {
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const { data: categories } = useSWR<Category[]>(API_ROUTES.GET_CATEGORIES, fetcher, {
        revalidateOnFocus: false, // Don't revalidate on focus
        revalidateOnReconnect: false, // Don't revalidate on reconnect
        keepPreviousData: true, // Keep previous data while loading new data
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, // 1 hour
        focusThrottleInterval: TIMINGS_MILLISECONDS.ONE_MINUTE, // 1 minute
    })

    return (
        <CurrentCategoryProviderContext.Provider value={{ currentCategory, setCurrentCategory, categories}}>
            {children}
        </CurrentCategoryProviderContext.Provider>
    );
}

export const useCurrentCategory = (initialCategory?: Category) => {
    const context = useContext(CurrentCategoryProviderContext);

    if (!context) {
        throw new Error("useCurrentCategory must be used within a CurrentCategoryProvider");
    }

    const { currentCategory, setCurrentCategory } = context;

    // Set initial category if provided and no current category is set
    React.useEffect(() => {
        if (initialCategory && !currentCategory) {
            setCurrentCategory(initialCategory);
        }
    }, [initialCategory, currentCategory, setCurrentCategory]);

    return context;
}