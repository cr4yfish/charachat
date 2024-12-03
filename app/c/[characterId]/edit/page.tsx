"use server";

import { getCharacter } from "@/functions/db/character";

import { Metadata } from "next";
import CharacterNew from "@/components/character/CharacterNew";
import { getCurrentUser } from "@/functions/db/auth";


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
    const profile = await getCurrentUser();

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Edit {character.name}</h2>
        </div>
        
        <CharacterNew editMode initCharacter={character} profile={profile} />
        </>
    )
}