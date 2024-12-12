"use server";

import { Character } from "@/types/db";
import CharacterCard from "./character/CharacterCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { safeParseLink } from "@/lib/utils";

type Props = {
    character: Character
}

export default async function Spotlight(props: Props) {


    return (
        <>
        <div className="w-full h-[320px] relative overflow-visible">
            <Card 
                className={`
                    h-full bg-zinc-50/70 dark:bg-zinc-600/10 relative overflow-hidden rounded-3xl
                `}
            >
                <CardHeader>
                    <CardDescription className="font-medium text-md">Check out this Character</CardDescription>
                    <CardTitle className="text-4xl font-bold">Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                    <CharacterCard data={props.character} hasLink noBg fullWidth />
                </CardContent>
            </Card>

            <div className="absolute -z-20 scale-[150%] scale-x-[100%] top-0 left-0 w-full h-full blur-2xl ">
                <Image 
                    className="object-cover z-50" 
                    src={safeParseLink(props.character.image_link)} 
                    fill
                    quality={1}
                    priority
                    alt="" 
                    sizes="100vw"
                />
            </div>
        
        </div>
   
        
        </>
    )
}