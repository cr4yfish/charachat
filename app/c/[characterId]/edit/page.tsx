"use server";

import Link from "next/link";

import Icon from "@/components/utils/Icon";
import { Button } from "@/components/utils/Button";
import { getCharacter } from "@/functions/db/character";

import CharacterEditMain from "@/components/character/CharacterEditMain";

export default async function CharacterView({ params: { characterId } } : { params: { characterId: string } }) {

    const character = await getCharacter(characterId);

    return (
        <>
        <div className="flex items-center gap-2">
            <Link href="/"><Button variant="light" isIconOnly><Icon filled>arrow_back</Icon></Button></Link>
            <h2 className="font-bold text-2xl">Edit {character.name}</h2>
        </div>
        
        <CharacterEditMain character={character} />
        </>
    )
}