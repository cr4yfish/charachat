"use server";

import { getCharacter } from "@/functions/db/character";
import { Character, Profile } from "@/types/db";
import { getCurrentUser } from "@/functions/db/auth";
import { getCharacterStories } from "@/functions/db/stories";
import CharacterPage from "@/components/character/CharacterPage";

export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;
    let profile: Profile | undefined = undefined;

    try {
        character = await getCharacter(characterId);
        profile = await getCurrentUser();    
    } catch (error) {
        console.error(error);
        return <p>Character not found</p>;
    }

    const stories = await getCharacterStories(characterId);
    

    return (
        <>
        <div className="relative w-full h-full min-h-full">
            <CharacterPage character={character} stories={stories} profile={profile} />   
        </div>
        
        </>
    )

}