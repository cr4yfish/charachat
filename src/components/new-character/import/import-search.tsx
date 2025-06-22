"use client";

import { Input } from "@/components/ui/input";
import { memo, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

type Props = {

    /**
     * Function to call when the search input changes.
     * @param search - The current search input value.
     */
    onSearchChange?: (search: string) => void;

    label?: string;
    placeholder?: string;
}

const PureImportSearch = ({ onSearchChange, placeholder }: Props) => {
    const [value, setValue] = useState("");
    const [debouncedValue] = useDebounce(value, 500);

    useEffect(() => {
        if(debouncedValue.length > 0) {
            console.log("Debounced value:", debouncedValue);
            onSearchChange?.(debouncedValue);
        }
    }, [debouncedValue, onSearchChange])

    return (
        <>
        <div className="w-full">
            <Input 
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                placeholder={placeholder ?? "Search for a character..."}
                className=" dark:bg-black/50 dark:backdrop-blur-3xl "
            />
        </div>
        </>
    )
}

export const ImportSearch = memo(PureImportSearch, (prevProps, nextProps) => {
    // Only re-render if the label, placeholder, or value changes
    return prevProps.label === nextProps.label &&
           prevProps.placeholder === nextProps.placeholder &&
                prevProps.onSearchChange === nextProps.onSearchChange;
});