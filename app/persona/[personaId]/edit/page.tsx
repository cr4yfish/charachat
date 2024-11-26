"use server";

import { getCharacter } from "@/functions/db/character";

import CharacterEditMain from "@/components/character/CharacterEditMain";
import { Metadata } from "next";


export async function generateMetadata(
    { params: { characterId } } : { params: { characterId: string } }
) : Promise<Metadata> {
    
    try {
        const character = await getCharacter(characterId);

        return {
            title: `Edit ${character.name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Editing Character`,
        }   
    }

}

export default async function CharacterView({ params: { characterId } } : { params: { characterId: string } }) {

    const character = await getCharacter(characterId);

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Edit {character.name}</h2>
        </div>
        
        <CharacterEditMain character={character} />
        </>
    )
}