"use server";

import PersonaEdit from "@/components/persona/PersonaEdit";
import { getPersona } from "@/functions/db/personas";
import { Metadata } from "next";


export async function generateMetadata(
    { params: { personaId } } : { params: { personaId: string } }
) : Promise<Metadata> {
    
    try {
        const persona = await getPersona(personaId);

        return {
            title: `Edit ${persona.full_name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Editing Character`,
        }   
    }

}

export default async function PersonaEditView({ params: { personaId } } : { params: { personaId: string } }) {

    const persona = await getPersona(personaId);

    return (
        <>
        <div className="flex items-center gap-2">
            <h2 className="font-bold text-2xl">Edit {persona.full_name}</h2>
        </div>
        
        <PersonaEdit editMode persona={persona} />
        </>
    )
}