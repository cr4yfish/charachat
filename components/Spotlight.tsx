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
                <CharacterCard data={props.character} hasLink noBg />

                <Image className=" object-cover -z-10" src={props.character.image_link ?? ""} layout="fill" alt="" />
            </CardContent>
            <CardFooter>
                
            </CardFooter>
        </Card>
        </>
    )
}