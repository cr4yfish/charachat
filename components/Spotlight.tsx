"use client";

import { Character } from "@/types/db";
import CharacterCard from "./character/CharacterCard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";

type Props = {
    character: Character
}

export default function Spotlight(props: Props) {


    return (
        <>
        <div className="w-full h-fit relative overflow-visible">
            <Card 
                className={`
                    dark:bg-zinc-600/10 relative overflow-hidden rounded-3xl
                `}
            >
                <CardHeader>
                    <CardDescription className="font-medium text-md">Check out this Character</CardDescription>
                    <CardTitle className="text-4xl font-bold">Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                    <CharacterCard data={props.character} hasLink noBg fullWidth />

                    <Image className=" object-cover -z-10 opacity-25" src={props.character.image_link ?? ""} layout="fill" alt="" />
                </CardContent>
                <CardFooter>
                    
                </CardFooter>
            </Card>

            <div className="absolute -z-20 scale-[150%] scale-x-[200%] top-0 left-0 w-full h-full blur-xl ">
                <Image className=" object-cover z-50" src={props.character.image_link ?? ""} layout="fill" alt="" />
            </div>
        
        </div>
   
        
        </>
    )
}