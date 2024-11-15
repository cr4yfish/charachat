"use server";

export default async function CharacterView({ params: { characterId } } : { params: { characterId: string } }) {
    
    return (
        <>
        <h1>Editing {characterId}</h1>
        </>
    )
}