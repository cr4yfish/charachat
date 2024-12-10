"use server";

import { LoadMoreProps } from "@/types/client";
import { Character } from "@/types/db";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import CharacterCard from "../character/CharacterCard";

type Props = {
    loader: (props: LoadMoreProps) => Promise<Character[]>;
    rows?: number; 
}

export default async function CharactersSwiper(props: Props) {
        
    const defaultLoad: LoadMoreProps = {
        cursor: 0,
        limit: 6*(props.rows ?? 3),
    }

    let characters: Character[] = [];
    
    try {
        characters = await props.loader(defaultLoad);
    } catch (e) {
        console.error(e);
        return (
            <>
            <h1>Something went wrong loading Characters</h1>
            </>
        )
    }

    return (
        <>
        <InfiniteSwiperLoader 
            loadMore={props.loader} 
            limit={15} 
            rows={props.rows ?? 3}
            initialData={characters} 
            component={CharacterCard}
            componentProps={{
            hasLink: true,
            }}
        />
        </>
    )
}