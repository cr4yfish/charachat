"use server";

import { Button } from "@/components/utils/Button";
import { getCharacter } from "@/functions/db/character";
import { Character } from "@/types/db";
import { redirect } from "next/navigation";
import { startChat } from "./actions";

export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;

    try {
        character = await getCharacter(characterId);
    } catch (error) {
        console.error(error);
        redirect("/error");
    }
   
    return (
        <>
        <div>
            <h1>{character.name}</h1>
            <p>{character.description}</p>
            <p>{character.bio}</p>
            <p>{character.intro}</p>
            <p>{character.book}</p>
            <form>
                <input type="hidden" name="characterId" value={characterId} />
                <Button type="submit" formAction={startChat} >Start Chat</Button>
            </form>
            
        </div>
        </>
    )

}