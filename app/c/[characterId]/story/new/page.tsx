"use server";

import NewStoryMain from "@/components/story/NewStoryMain";
import { getCurrentUser } from "@/functions/db/auth";
import { getCharacter } from "@/functions/db/character";
import { Profile } from "@/types/db";
import { redirect } from "next/navigation";

type Params = Promise<{ characterId: string }>

export default async function NewStory({ params }: { params: Params }) {
    const { characterId } = await params;
    let profile: Profile | undefined = undefined;
    
    try {
        profile = await getCurrentUser();
    } catch (e) {
        console.error(e);
        redirect("/");
    }
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