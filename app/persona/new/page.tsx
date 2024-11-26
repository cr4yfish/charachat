"use server";

import PersonaNewMain from "@/components/persona/PersonaNewMain";
import { getCurrentUser } from "@/functions/db/auth";
import { Profile } from "@/types/db";

export default async function NewCharacter() {

    let profile: Profile | undefined = undefined;

    try {
        profile = await getCurrentUser();
    } catch(e) {
        console.error(e);
        return (
            <>
            <div className="flex flex-col">
                <h2 className="font-bold text-2xl">Error</h2>
                <p>Could not load user profile</p>
            </div>
            </>
        )
    }

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Create a new Persona</h2>
        </div>
        
        <PersonaNewMain profile={profile} />
        </>
    )
}