"use client";

import React from "react";
import { Category } from "@/types/db";
import { createContext, useContext, useState, ReactNode } from "react";

interface CategoryContextProps {
    currentCategory: Category | null;
    setCurrentCategory: (category: Category) => void;
}

const CurrentCategoryProviderContext = createContext<CategoryContextProps | null>(null);

export const CurrentCategoryProvider = ({ children } : { children: ReactNode }) => {
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

    return (
        <CurrentCategoryProviderContext.Provider value={{ currentCategory, setCurrentCategory }}>
            {children}
        </CurrentCategoryProviderContext.Provider>
    );
}

export const useCurrentCategory = () => {
    const context = useContext(CurrentCategoryProviderContext);

    if (!context) {
        throw new Error("useCurrentCategory must be used within a SharedChatProvider");
    }

    return context;
}