"use server";

import { Profile, Persona } from "@/types/db";
import { getCurrentUser } from "@/functions/db/auth";
import { Metadata } from "next";
import { getPersona } from "@/functions/db/personas";
import PersonaPage from "@/components/persona/PersonaPage";


export async function generateMetadata(
    { params: { personaId } } : { params: { personaId: string } }
) : Promise<Metadata> {
    
    try {
        const persona = await getPersona(personaId);

        return {
            title: `${persona.full_name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing Persona`,
        }   
    }

}


export default async function PersonaView({ params: { personaId } }: { params: { personaId: string } }) {

    let persona: Persona | null = null;
    let profile: Profile | undefined = undefined;

    try {
        persona = await getPersona(personaId);
    } catch (error) {
        console.error(error);
        return (
            <>
            <div className="px-4 py-6 pt-20 prose dark:prose-invert overflow-y-auto pb-20">
                <h1 className="text-3xl font-bold text-red-500">Persona not found</h1>
                <h2>This could have different reasons:</h2>
                <ul>
                    <li>The URL/CharacterID is wrong</li>
                    <li>The Persona was deleted or set to private</li>
                    <li>You do not have permission to view this Persona</li>
                    <li>The Persona was set to private before the Encryption update</li>
                </ul>
                <div>
                    <p className="m-0 mb-1 font-medium">Persona ID</p>
                    <pre className="select-all m-0">{personaId}</pre>
                </div>
                <h2>Potential fixes for this issue</h2>
                <ul>
                    <li>Refresh the browser tab / Restart the App</li>
                    <li>Log out and back in if you believe you should be able to view this Persona</li>
                    <li>Search for the Persona to see if it&apos;s still available</li>
                    <li>Tap the button below if your Persona was set to private before Persona Encryption was introduced</li>
                </ul>
                
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
            console.error("Error in persona/personaId", error);
        };
    }
    

    return (
        <>
        <div className="relative w-full h-full min-h-full">
            <PersonaPage persona={persona} profile={profile} />   
        </div>
        
        </>
    )

}