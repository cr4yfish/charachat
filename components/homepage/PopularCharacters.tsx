"use server";

import { LoadMoreProps } from "@/types/client";
import { Character } from "@/types/db";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import CharacterCard from "../character/CharacterCard";

type Props = {
    loader: (props: LoadMoreProps) => Promise<Character[]>;
    
}

export default async function PopularCharactersSwiper(props: Props) {
        
    const defaultLoad: LoadMoreProps = {
        cursor: 0,
        limit: 15,
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
            limit={5} 
            rows={3}
            initialData={characters} 
            component={CharacterCard}
            componentProps={{
            hasLink: true,
            }}
        />
        </>
    )
}