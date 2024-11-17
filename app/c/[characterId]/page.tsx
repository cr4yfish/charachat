"use server";

import { Button } from "@/components/utils/Button";
import { getCharacter } from "@/functions/db/character";
import { Character } from "@/types/db";
import { redirect } from "next/navigation";
import { startChat } from "./actions";
import { getSession } from "@/functions/db/auth";
import { getCharacterStories } from "@/functions/db/stories";
import CharacterPage from "@/components/character/CharacterPage";

export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;

    try {
        character = await getCharacter(characterId);
        
    } catch (error) {
        console.error(error);
        return <p>Character not found</p>;
    }

    const stories = await getCharacterStories(characterId);
    
    const { session } = await getSession();

    if(session?.user.id == null) {
        redirect("/auth");
    }

    return (
        <>

        <div className="z-20 absolute bottom-0 left-0 w-full flex items-center justify-center pb-5 px-4">
            <form className="w-full">
                <input type="hidden" name="characterId" value={characterId} />
                <Button size="lg" fullWidth color="primary" variant="shadow" type="submit" formAction={startChat} >Start Chat</Button>
            </form>
        </div>

        <CharacterPage character={character} stories={stories} />
        </>
    )

}