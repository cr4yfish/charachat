"use server";

import CharacterNewMain from "@/components/character/CharacterNewMain";

export default async function NewCharacter() {

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Create a new Character</h2>
        </div>
        
        <CharacterNewMain />
        </>
    )
}