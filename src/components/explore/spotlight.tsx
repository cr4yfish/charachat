"use client";

import { Card, CardContent, CardTitle } from "../ui/card";
import SpotlighFallback from "./spotlight-fallback";
import useSWR from "swr";
import { Character } from "@/types/db";
import { fetcher } from "@/lib/utils";
import ImageWithBlur from "../image/imageWithBlur";
import { Button } from "../ui/button";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { setCharacterCookie } from "@/app/actions";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";

export type SpotlightData = {
    character: Character,
    palette: {
        Vibrant?: string;
        DarkVibrant?: string;
        LightVibrant?: string;
        Muted?: string,
        DarkMuted?: string;
        LightMuted?: string;
    } | null;
}

export default function Spotlight({ init } : { init: SpotlightData }) {
    const router = useRouter();
    const { data, error } = useSWR<SpotlightData>("/api/spotlight", fetcher, 
        {
            dedupingInterval: TIMINGS_MILLISECONDS.ONE_DAY, // 1 hour
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            focusThrottleInterval: TIMINGS_MILLISECONDS.ONE_HOUR, // 1 hour
            revalidateOnMount: false,
            keepPreviousData: true,
            fallbackData: init, // Use initial data if provided
        }
    )

    const openChat = useCallback(async () => {
        if(!data?.character.id) return;
        await setCharacterCookie(data.character.id);
        router.push(`/chat`);
    }, [data, router]);


    if(error) {
        console.error("Error fetching spotlight data:", error);
        return <SpotlighFallback />;
    }

    return (
        <div className="w-full h-fit min-h-[320px] mb-4 relative overflow-visible">
            
            <Card className={`h-full relative overflow-hidden rounded-3xl rounded-t-none !bg-transparent border-none z-10  flex flex-col gap-2 p-0 `} style={{ boxShadow: `0 10px 20px ${data?.palette?.Vibrant}25` }}>
                <CardContent className="p-0" >
                    <div className="max-h-[180px] ">
                        <div className="absolute top-0 left-0 size-full bg-gradient-to-b z-0" style={{ backgroundImage: `linear-gradient(transparent, ${data?.palette?.Vibrant ?? "black"})` }} ></div>
                        <ImageWithBlur 
                            src={data?.character.image_link}
                            aspectRatio={9/10}
                            alt=""
                            fill
                            className="object-cover object-top -z-10"
                        />
                    </div>
                    
                    <div className="w-full flex flex-col gap-2 p-4 z-20 backdrop-blur-[1px] ">
                        <div className="relative flex flex-col justify-center  ">
                            <span className="text-black/75 text-xs font-medium"  style={{ color: ` color-mix(in srgb, black 70%, ${data?.palette?.Vibrant})` }}>Spotlight</span>
                            <CardTitle className="text-4xl font-black truncate " style={{ color: ` color-mix(in srgb, black 80%, ${data?.palette?.Vibrant})` }} >{data?.character.name}</CardTitle>
                            <span className="truncate text-xs max-w-[66%]" style={{ color: ` color-mix(in srgb, black 70%, ${data?.palette?.Vibrant})` }} >{data?.character.description}</span>
                            {/* <span className="text-black/75 text-sm truncate font-medium" >By @{data?.character.owner?.username}</span> */}
                        </div>
                        <Link href={`/chat?char=${data?.character.id}`} className="flex items-center gap-2" onClick={(e) => {
                                e.preventDefault();
                                openChat();
                            }}>
                            <Button 
                                variant={"ghost"} 
                                size={"lg"} 
                                className="font-bold rounded-3xl " style={{ background: `color-mix(in srgb, black 80%, ${data?.palette?.Vibrant})`, color: ` color-mix(in srgb, white 90%, ${data?.palette?.Vibrant})` }} 
                            >
                                <span>Chat now</span>
                                <ChevronRightIcon />
                            </Button>
                        </Link>
             
                   </div>
                </CardContent>
            </Card>

            {/* Background color */}
            <div 
                className={`absolute select-none pointer-events-none scale-[150%] scale-y-[300%] -translate-y-[200px] opacity-15 dark:opacity-20 blur-3xl top-0 left-0 w-full h-full`}
                style={{  backgroundColor: data?.palette ? data?.palette.Vibrant : "" }}
            ></div>

        </div>
    )

}