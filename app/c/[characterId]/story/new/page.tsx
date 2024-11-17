"use server";

import NewStoryMain from "@/components/story/NewStoryMain";
import { getCurrentUser } from "@/functions/db/auth";
import { getCharacter } from "@/functions/db/character";

export default async function NewStory({ params: { characterId } }: { params: { characterId: string } }) {

    const profile = await getCurrentUser();
    const character = await getCharacter(characterId);

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Create a new Story</h2>
        </div>
        
        <NewStoryMain 
            profile={profile} 
            character={character}
        /> 
        </>
    )
}