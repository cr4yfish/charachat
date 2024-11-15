"use server";

import { Button } from "@/components/utils/Button";
import { getCharacter } from "@/functions/db/character";
import { Character } from "@/types/db";
import { redirect } from "next/navigation";
import { startChat } from "./actions";
import { getChats } from "@/functions/db/chat";

import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-2">
                <h2 className="prose dark:prose-invert font-bold text-2xl">{character.name}</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>{character.name}</CardTitle>
                        <CardDescription>{character.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{character.bio}</p>
                        <p>{character.intro}</p>
                    </CardContent>
                    <CardFooter>
                        <form>
                            <input type="hidden" name="characterId" value={characterId} />
                            <Button type="submit" formAction={startChat} >Start Chat</Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="flex flex-col gap-2">
                <h2 className="prose dark:prose-invert font-bold text-2xl">Your Chats</h2>
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
            </div>
            
        </div>
        </>
    )

}