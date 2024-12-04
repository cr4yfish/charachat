"use server";

import PersonaEdit from "@/components/persona/PersonaEdit";
import { getPersona } from "@/functions/db/personas";
import { Metadata } from "next";

type Params = Promise<{ personaId: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    
    const { personaId } = await params;
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

export default async function PersonaEditView({ params } : { params: Params }) {
    const { personaId } = await params
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