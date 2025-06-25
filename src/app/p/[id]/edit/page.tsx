import CharacterEditTopHeader from "@/components/character/character-edit-top-header";
import PersonaEdit from "@/components/personas/persona-edit";
import { getPersona } from "@/lib/db/persona";


type Params = Promise<{ id: string }>

export default async function EditPage({ params }: { params: Params }) {

    const { id } = await params;
    const persona = await getPersona(id)
    return (
        <div className="relative w-full h-full min-h-full">
            <CharacterEditTopHeader name={persona.full_name} href={"/p/" + persona.id} />
            <div className="relative size-full overflow-x-hidden">
                <PersonaEdit persona={persona} />
            </div>
        </div>
    )
}