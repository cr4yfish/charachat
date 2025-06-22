import { getCharacter } from "@/lib/db/character";

type Params = Promise<{ id: string }>

export default async function EditPage({ params }: { params: Params }) {

    const { id } = await params;
    const char = await getCharacter(id)
    return (
        <div className="h-full flex items-center justify-center">
            <h1 className="text-2xl font-bold">Edit Character Page</h1>
            <span>{id}</span>
            <span>{char.name}</span>
            <p className="text-muted-foreground">This page is under construction.</p>
        </div>
    )
}