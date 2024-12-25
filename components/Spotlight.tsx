"use server";

import CharacterCard from "./character/CharacterCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { safeParseLink } from "@/lib/utils";
import { getNewestCharacter } from "@/functions/db/character";
import Vibrant from 'node-vibrant';

export default async function Spotlight() {
    const character = await getNewestCharacter();
    const imageUrl = safeParseLink(character.image_link);

    const isSupportedUrl = !imageUrl.includes(".webp");

    const palette = isSupportedUrl && await Vibrant.from(imageUrl).getPalette();

return (
    <div className="w-full h-[320px] relative overflow-visible">
        <Card className={`h-full relative overflow-hidden rounded-3xl bg-transparent z-10 dark:bg-neutral-900/50`}>
            <div className="absolute top-0 left-0 w-full h-full dark:opacity-10 opacity-90 " style={{ backgroundColor: palette ? palette.DarkVibrant?.hex : "" }}></div>
            
            <CardHeader className="z-10 relative">
                <CardDescription className={`font-medium text-md dark:text-neutral-200 text-neutral-200`}>Check out this Character</CardDescription>
                <CardTitle className="text-4xl font-bold" style={{ color: palette ? palette.LightVibrant?.hex : "" }}>Spotlight</CardTitle>
            </CardHeader>
            <CardContent>
                <CharacterCard data={character} hasLink fullWidth bgOverwrite="bg-white" />
            </CardContent>
        </Card>
        <div 
            className={`absolute select-none pointer-events-none scale-[150%] scale-y-[300%] -translate-y-[200px] opacity-15 dark:opacity-20 blur-3xl top-0 left-0 w-full h-full`}
            style={{  backgroundColor: palette ? palette.Vibrant?.hex : "" }}
        ></div>
    </div>
    )
}