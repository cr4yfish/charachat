"use client";

import { Character } from "@/types/db";
import { Button } from "../utils/Button";


type Props = {
    character: Character;
    setCharacter: (character: Character) => void;
}

export default function CharacterNewImport(props: Props) {

    return (
        <>
            <div>
            <h1>Import</h1>
            
            <Button onClick={() => props.setCharacter(props.character)}>placeholder</Button>
            </div>
        
        </>
    )
}