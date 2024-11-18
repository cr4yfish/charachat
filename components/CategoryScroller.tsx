"use client";

import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { useEffect, useState } from "react";

import { Category, Character } from "@/types/db";
import CategoryCard from "./character/CategoryCard";
import { getCharactersByCategory } from "@/functions/db/character";
import CharacterCard from "./character/CharacterCard";
import { Spinner } from "@nextui-org/spinner";


type Props = {
    categories: Category[]
}

export default function CategoryScroller(props: Props) {
    const [currentCategory, setCurrentCategory] = useState<Category>({} as Category);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(props.categories.length > 0) {
            setCharacters([])
            setCurrentCategory(props.categories[0]);
        }
    }, [props.categories])

    useEffect(() => {
        if(currentCategory.id) {
            setCharacters([])
            handleGetCharacters();
        }
    }, [currentCategory])

    const handleGetCharacters = async () => {
        setIsLoading(true);
        try {
            const res = await getCharactersByCategory(currentCategory.id);   
            setCharacters(res);
        } catch (error) {
            console.error(error)
        }
        setIsLoading(false);
    }

    return (
        <>
        <div className="flex flex-col gap-2">
            <h2 className="dark:prose-invert text-xl font-bold">Categories</h2>
            <ScrollShadow orientation={"horizontal"} className="overflow-x-auto">
            <div className="w-fit flex flex-row gap-4 pr-10 pb-4">
                {props.categories.map((category) => (
                    <CategoryCard 
                        isSelected={category.id == currentCategory.id} 
                        isButton 
                        key={category.id} 
                        category={category} 
                        onClick={() => setCurrentCategory(category)}
                    />
                ))}
            </div>
            </ScrollShadow>

            <ScrollShadow orientation={"horizontal"} className="overflow-x-auto">
                <div className="w-fit flex flex-row gap-4 pr-10 pb-4">
                    {characters.map((character) => (
                    <CharacterCard hasLink key={character.id} character={character} />
                    ))}
                </div>
            </ScrollShadow>

            {isLoading && 
                <div>
                    <Spinner />
                </div>
            }

            {!isLoading && characters.length == 0 &&
                <div>
                    <p>No characters found in this category</p>
                </div>
            }
        </div>
            
        </>
    )

}