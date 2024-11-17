"use server";

import NewStoryMain from "@/components/story/NewStoryMain";
import { getCurrentUser } from "@/functions/db/auth";
import { getCharacter } from "@/functions/db/character";
import { getStory } from "@/functions/db/stories";

export default async function EditStory({ params: { characterId, storyId } }: { params: { characterId: string, storyId: string } }) {

    const profile = await getCurrentUser();
    const character = await getCharacter(characterId);
    const story = await getStory(storyId);

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Edit your Story</h2>
        </div>
        
        <NewStoryMain 
            profile={profile} 
            character={character}
            editMode
            story={story}
        /> 
        </>
    )
}