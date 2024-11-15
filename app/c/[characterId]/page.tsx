"use server";

import { Button } from "@/components/utils/Button";
import { getCharacter } from "@/functions/db/character";
import { Character } from "@/types/db";
import { redirect } from "next/navigation";
import { startChat } from "./actions";
import { getChats } from "@/functions/db/chat";

import {
    Card, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import CharacterCard from "@/components/character/CharacterCard";
import CharacterDetailsAccordion from "@/components/character/CharacterDetailsAccordion";

export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;

    try {
        character = await getCharacter(characterId);
    } catch (error) {
        console.error(error);
        redirect("/error");
    }

    const userChats = await getChats(characterId);
    
    return (
        <>
        <div className="flex flex-col gap-4 pb-20">

            <div className="flex flex-col gap-2">
                <h2 className="prose dark:prose-invert font-bold text-4xl">{character.name}</h2>
                <CharacterCard hasLink={false} character={character} />

                <CharacterDetailsAccordion character={character} />

                <form>
                    <input type="hidden" name="characterId" value={characterId} />
                    <Button fullWidth color="primary" variant="shadow" type="submit" formAction={startChat} >Start Chat</Button>
                </form>
            </div>
            
            <div className="flex flex-col gap-2">
                <h2 className="prose dark:prose-invert font-bold text-xl">Your Chats with {character.name}</h2>
                <ScrollArea className=" h-full max-h-[50vh]">
                    <div className="flex flex-col gap-2 h-fit">
                        {userChats.map((chat) => (
                            <Link key={chat.id} href={`/chat/${chat.id}`}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{chat.title}</CardTitle>
                                        <CardDescription>{chat.character.name}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
                {userChats.length == 0 && (
                    <p className="dark:prose-invert dark:text-slate-400">You have no chats with this character.</p>   
                )}
            </div>
            
        </div>
        </>
    )

}