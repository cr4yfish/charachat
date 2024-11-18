"use server";

import Link from "next/link";

import { Button } from "@/components/utils/Button";
import Icon from "@/components/utils/Icon";

import { getUserCharacters } from "@/functions/db/character";
import CharacterCard from "@/components/character/CharacterCard";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

export default async function UserCharacters({ params: { userId } } : { params: { userId: string } }) {

    const characters = await getUserCharacters(userId);

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 h-full w-full pb-20">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Your Characters</h1>
                </div>
                
                <Link href={"/c/new"}>
                    <Button isIconOnly variant="light" color="warning"><Icon>add</Icon></Button>
                </Link>
                
            </div>

            <ScrollShadow className="overflow-y-auto max-h-full pb-20">
                <div className="flex flex-col gap-2 w-full h-fit relative">
                    {characters.map((character) => (
                        <CharacterCard fullWidth hasLink key={character.id} character={character} />   
                    ))}
                </div>
            </ScrollShadow>
         
        </div>
        </>
    )
}