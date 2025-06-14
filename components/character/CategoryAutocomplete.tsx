"use client";


import React from "react";
import { useAsyncList } from "@react-stately/data";

import { Category } from "@/types/db";
import { searchCategories } from "@/functions/db/categories";

type Props = {
    setCategory?: (category: Category) => void;
    defaultCategory?: Category;
}

export default function CategoryAutocomplete(props: Props) {

    const list = useAsyncList<Category>({
        initialSelectedKeys: props.defaultCategory ? [props.defaultCategory.id] : [],
        initialFilterText: props.defaultCategory ? props.defaultCategory.title : "",
        async load({filterText}) {
            const res = await searchCategories(filterText || "");

            return {
                items: res
            }
        }
    })


    return (
        <Autocomplete 
            label="Pick a Category"
            placeholder="Search for a category"
            isRequired
            name="category"
            isLoading={list.isLoading}
            items={list.items}
            inputValue={list.filterText}
            defaultInputValue={props.defaultCategory?.title ?? "default"}
            onInputChange={list.setFilterText}
            onSelectionChange={(key: React.Key | null) => {
                if(!key) return;

                if(props.setCategory) {
                    props.setCategory(list.items.find((item) => item.id === key) as Category);
                }
            }}
        >
            {(item) => (
                <AutocompleteItem key={item.id} className="capitalize">
                    {item.title}
                </AutocompleteItem>
            )}
        </Autocomplete>
    )
}