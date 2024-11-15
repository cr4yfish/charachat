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
import Icon from "@/components/utils/Icon";
import { getSession } from "@/functions/db/auth";

export default async function CharacterView({ params: { characterId } }: { params: { characterId: string } }) {

    let character: Character | null = null;

    try {
        character = await getCharacter(characterId);
    } catch (error) {
        console.error(error);
        return <p>Character not found</p>;
    }

    const userChats = await getChats(characterId);
    
    const { session } = await getSession();

    if(session?.user.id == null) {
        redirect("/auth");
    }

    return (
        <>
        <div className="flex flex-col gap-4 pb-20">

            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2">
                    <Link href="/"><Button variant="light" isIconOnly><Icon filled>arrow_back</Icon></Button></Link>
                    <div className="flex items-center justify-between w-full">
                        <h2 className="prose dark:prose-invert font-bold text-2xl">{character.name}</h2>
                        {character.owner.user == session.user.id &&
                            <Link href={`/c/${character.id}/edit`}>
                                <Button isIconOnly variant="light" size="lg"><Icon filled>settings</Icon></Button>
                            </Link>
                        }   
                    </div>
      
                </div>
          
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