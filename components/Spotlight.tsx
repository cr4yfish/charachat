"use server";

import CharacterCard from "./character/CharacterCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { safeParseLink } from "@/lib/utils";
import { getNewestCharacter } from "@/functions/db/character";
import Vibrant from 'node-vibrant';

export default async function Spotlight() {
    const character = await getNewestCharacter();

    const imageUrl = safeParseLink(character.image_link);
    const palette = await Vibrant.from(imageUrl).getPalette();

    return (
        <div className="w-full h-[320px] relative overflow-visible">
            <Card className={`h-full bg-zinc-50/70 dark:bg-zinc-600/10 relative overflow-hidden rounded-3xl`}>
                <CardHeader>
                    <CardDescription className={`font-medium text-md text-zinc-700 dark:text-zinc-200`} >Check out this Character</CardDescription>
                    <CardTitle className="text-4xl font-bold " style={{ color: palette.LightVibrant?.hex }}>Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                    <CharacterCard data={character} hasLink noBg fullWidth />
                </CardContent>
            </Card>
            <div 
                className={`absolute -z-20 scale-[150%] scale-y-[300%] -translate-y-[200px] opacity-60 blur-2xl top-0 left-0 w-full h-full`}
                style={{  backgroundColor: palette.Vibrant?.hex }}
            ></div>
        </div>
    )
}