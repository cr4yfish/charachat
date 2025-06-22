"use client";

import { API_ROUTES } from "@/lib/apiRoutes";
import { fetcher } from "@/lib/utils";
import { Character } from "@/types/db";
import useSWR from "swr";
import ImageCharacterCard from "../character/character-card-image";

export const PureYourCharacters = () => {
    const { data: characters, isLoading } = useSWR<Character[]>(API_ROUTES.GET_OWN_CHARACTERS, fetcher)

    return (
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Your Characters</h1>
            <div className="w-full flex flex-row items-center justify-start gap-4 overflow-x-auto mt-2">
                {isLoading && <div className="text-muted-foreground">Loading...</div>}
                {characters?.length === 0 && !isLoading && <div className="text-muted-foreground">You have no characters yet.</div>}
                {characters?.map(char => 
                    <ImageCharacterCard data={char} hasLink key={char.id} />
                )}
            </div>

        </div>
    );
}

export const YourCharacters = PureYourCharacters