"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "../ui/button";
import ButtonGroup from "../ui/button-group";
import { useRouter } from "next/navigation";
import { memo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SearchType, SortType } from "@/app/search/page";

const PureSearchCategories = ({ initType, initSortType } : { initType?: SearchType | undefined, currentQuery?: string, initSortType?: SortType }) => {
    const router = useRouter();

    return (
        <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center">
                <ButtonGroup 
                    value={initType || "characters"}
                    onValueChange={(value) => {
                        const currentSearchParams = new URLSearchParams(window.location.search);
                        currentSearchParams.set("type", value);
                        router.push(`/search?` + currentSearchParams.toString());
                    }}
                    options={[
                        { label: "Characters", value: "characters" },
                        { label: "Collections", value: "collections", disabled: true } ,
                        { label: "Creators", value: "creators", disabled: true } ,
                    ]}
                />
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"ghost"}>
                        <ArrowDownUpIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <ButtonGroup 
                        dir="vertical"
                        value={initSortType || "relevance"}
                        onValueChange={(value) => {
                            const currentSearchParams = new URLSearchParams(window.location.search);
                            currentSearchParams.set("sort", value);
                            router.push(`/search?` + currentSearchParams.toString());
                        }}
                        options={[
                            { label: "Relevance", value: "relevance" },
                            { label: "Newest", value: "newest" },
                            { label: "Popular", value: "popular" },
                            { label: "Likes", value: "likes" }
                        ]}
                    />
                </PopoverContent>
            </Popover>

        </div>
    );
}

export const SearchCategories = memo(PureSearchCategories, (prevProps, nextProps) => {
    if(prevProps.currentQuery !== nextProps.currentQuery) return false;
    if(prevProps.initType !== nextProps.initType) return false;
    
    return true;
});