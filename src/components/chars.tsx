"use client";

import { fetcher } from "@/lib/utils";
import { useEffect } from "react";
import useSWR from "swr";

export function Chars() {

    const { data } = useSWR('/api/characters/trending', fetcher);

    useEffect(() => {
        console.log("Characters data:", data);
    }, [data])

    return (
        <div>
            <h1>Characters Component</h1>
            {/* Add your character-related UI here */}

            {data?.map((character: any) => (
                <div key={character.id}>
                    <h2>{character.name}</h2>
                    <p>{character.description}</p>
                </div>
            ))}
        </div>
    );
}