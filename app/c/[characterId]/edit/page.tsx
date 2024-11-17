"use server";

import { getCharacter } from "@/functions/db/character";

import CharacterEditMain from "@/components/character/CharacterEditMain";

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