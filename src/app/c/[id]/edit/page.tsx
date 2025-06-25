import CharacterEdit from "@/components/character/character-edit";
import CharacterEditTopHeader from "@/components/character/character-edit-top-header";
import { getCharacter } from "@/lib/db/character";


type Params = Promise<{ id: string }>

export default async function EditPage({ params }: { params: Params }) {

    const { id } = await params;
    const char = await getCharacter(id)
    return (
        <div className="relative w-full h-full min-h-full">
            <CharacterEditTopHeader name={char.name} href={"/c/" + char.id} />
            <div className="relative size-full overflow-x-hidden">
                <CharacterEdit character={char} />
            </div>
        </div>
    )
}