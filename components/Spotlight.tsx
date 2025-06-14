"use client";

import CharacterCard from "./character/CharacterCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import SpotlighFallback from "./homepage/SpotlightFallback";
import useSWR from "swr";
import { Character } from "@/types/db";
import { fetcher } from "@/lib/utils";

type Color = {
    hex: string;
}

type SpotlightData = {
    character: Character,
    palette: {
        DarkVibrant?: Color;
        LightVibrant?: Color;
        Vibrant?: Color;
    } | null;
}

export default function Spotlight() {

    const { data, error } = useSWR<SpotlightData>("/api/spotlight", fetcher, 
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 1000 * 60 * 60, // Refresh every hour
        }
    )

    if(error) {
        console.error("Error fetching spotlight data:", error);
        return <SpotlighFallback />;
    }
    
    return (
        <div className="w-full h-[320px] relative overflow-visible">
            <Card className={`h-full relative overflow-hidden rounded-3xl bg-transparent z-10 dark:bg-neutral-900/50`}>
                <div className="absolute top-0 left-0 w-full h-full dark:opacity-10 opacity-90 " style={{ backgroundColor: data?.palette ? data?.palette.DarkVibrant?.hex : "" }}></div>
                
                <CardHeader className="z-10 relative">
                    <CardDescription className={`font-medium text-md dark:text-neutral-200 text-neutral-200`}>Check out this Character</CardDescription>
                    <CardTitle className="text-4xl font-bold" style={{ color: data?.palette ? data?.palette.LightVibrant?.hex : "" }}>Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                    {data?.character && <CharacterCard data={data.character} hasLink fullWidth bgOverwrite="bg-white" />}
                </CardContent>
            </Card>
            <div 
                className={`absolute select-none pointer-events-none scale-[150%] scale-y-[300%] -translate-y-[200px] opacity-15 dark:opacity-20 blur-3xl top-0 left-0 w-full h-full`}
                style={{  backgroundColor: data?.palette ? data?.palette.Vibrant?.hex : "" }}
            ></div>
        </div>
    )

}