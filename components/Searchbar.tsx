"use client";

import { Input } from "@nextui-org/input";

import Icon from "./utils/Icon";
import React from "react";


export default function Searchbar() {

    const [search, setSearch] = React.useState<string>("");
    const [results, setResults] = React.useState<any[]>([]);


    const handleSearch = () => {
        // fetch the data from the server
        setResults([{id: 1, name: "John Doe"}]);
    }

    React.useEffect(() => {
        setTimeout(() => {
            handleSearch();
        }, 500);
    }, [results])

    return (
        <>
        <Input 
            placeholder="Search Characters and Stories" 
            radius="full"
            isDisabled
            startContent={<Icon>search</Icon>}
            size="lg"
            
            value={search}
            onValueChange={setSearch}
        />

        <div>
            {results.map((result) => (
                <div key={result.id}>
                    <p>{result.name}</p>
                </div>
            ))}
        </div>
        </>
    )
}