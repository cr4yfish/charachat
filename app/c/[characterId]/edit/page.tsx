"use server";

import { getCharacter } from "@/functions/db/character";

import { Metadata } from "next";
import CharacterNew from "@/components/character/CharacterNew";
import { getCurrentUser } from "@/functions/db/auth";

type Params = Promise<{ characterId: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    const { characterId } = await params;
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

export default async function CharacterView({ params } : { params: Params }) {
    const { characterId } = await params;
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