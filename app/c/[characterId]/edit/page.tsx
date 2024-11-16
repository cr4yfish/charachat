"use server";

import { getCharacter } from "@/functions/db/character";

import CharacterEditMain from "@/components/character/CharacterEditMain";
import BackLink from "@/components/utils/BackLink";

export default async function CharacterView({ params: { characterId } } : { params: { characterId: string } }) {

    const character = await getCharacter(characterId);

    return (
        <>
        <div className="flex items-center gap-2">
            <BackLink />
            <h2 className="font-bold text-2xl">Edit {character.name}</h2>
        </div>
        
        <CharacterEditMain character={character} />
        </>
    )
}