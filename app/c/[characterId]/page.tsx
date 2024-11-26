"use server";

import { getCharacter } from "@/functions/db/character";
import { Character, Profile } from "@/types/db";
import { getCurrentUser } from "@/functions/db/auth";
import { getCharacterStories } from "@/functions/db/stories";
import CharacterPage from "@/components/character/CharacterPage";
import DeleteCharacterButton from "@/components/character/DeleteCharacterButton";
import { Metadata } from "next";


export async function generateMetadata(
    { params: { characterId } } : { params: { characterId: string } }
) : Promise<Metadata> {
    
    try {
        const character = await getCharacter(characterId);

        return {
            title: `${character.name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing Characters`,
        }   
    }

}


export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;
    let profile: Profile | undefined = undefined;

    try {
        character = await getCharacter(characterId);
    } catch (error) {
        console.error(error);
        return (
            <>
            <div className="px-4 py-6 pt-20 prose dark:prose-invert overflow-y-auto pb-20">
                <h1 className="text-3xl font-bold text-red-500">Character not found</h1>
                <h2>This could have different reasons:</h2>
                <ul>
                    <li>The URL/CharacterID is wrong</li>
                    <li>The Character was deleted or set to private</li>
                    <li>You do not have permission to view this Character</li>
                    <li>The Character was set to private before the Encryption update</li>
                </ul>
                <div>
                    <p className="m-0 mb-1 font-medium">Character ID</p>
                    <pre className="select-all m-0">{characterId}</pre>
                </div>
                <h2>Potential fixes for this issue</h2>
                <ul>
                    <li>Refresh the browser tab / Restart the App</li>
                    <li>Log out and back in if you believe you should be able to view this Character</li>
                    <li>Search for the Character to see if it&apos;s still available</li>
                    <li>Tap the button below if your Character was set to private before Character Encryption was introduced</li>
                </ul>

                <div>
                    <h3>If this Character was Private</h3>
                    <p>If you set this Character to private before the Encryption update was introduced, then please delete the Character and remake it. Sorry for the inconvinience.</p>
                    <DeleteCharacterButton characterId={characterId} />
                </div>
                
            </div>
            </>
        )
    }

    try {
        profile = await getCurrentUser();  
    } catch (error) {
        const err = error as Error;
        // Anons are allowed here, not an error
        if(err.message !== "No user found") {
            console.error("Error in c/characterId", error);
        };
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