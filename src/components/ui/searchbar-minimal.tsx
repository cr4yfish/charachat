"use client";

import { memo, useEffect, useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { SearchIcon, XIcon } from "lucide-react";

type Props = {
    initialQuery?: string;
    placeholder?: string;
    onChange?: (query: string) => void;
}

const PureSearchBarMinimal = ({ initialQuery, onChange, placeholder } : Props) => {
    const [input, setInput] = useState<string>(initialQuery || " ");

    // update input state when initialQuery changes
    useEffect(() => {
        if(initialQuery) {
            setInput(initialQuery);
        }
    }, [initialQuery])

    const handleChange = (value: string) => {
        setInput(value);
        if (onChange) {
            onChange(value);
        }
    }
    
    const handleClear = () => {
        setInput("");
        if (onChange) {
            onChange("");
        }
    }

    return (
        <div className="relative bg-slate-800/50 border border-border rounded-full w-full h-fit flex items-center justify-center backdrop-blur-lg max-w-[600px]  ">
            <Button type="submit" className="absolute left-0 top-0 h-full flex items-center justify-center text-slate-200/80 ml-1" variant={"link"}>
                <SearchIcon />
            </Button>
            <Input 
                placeholder={placeholder || "Search..."}
                value={input}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full bg-transparent pl-10 text-sm rounded-full pr-[50px]"
                name="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            />
            {(input && input.length > 0) &&
                <Button 
                    variant={"link"} 
                    className="text-slate-200/80 absolute right-0 top-0 h-full flex items-center justify-center mr-1"
                    onClick={handleClear}
                > 
                    <XIcon />
                </Button>
            }
        </div>
    )
}

const SearchBarMinmal = memo(PureSearchBarMinimal, (prevProps, nextProps) => {
    // Only re-render if the onSearch prop changes
    if (prevProps.initialQuery !== nextProps.initialQuery) return false;
    if (prevProps.placeholder !== nextProps.placeholder) return false;
    if (prevProps.onChange !== nextProps.onChange) return false;

    return true;
});

export default SearchBarMinmal;