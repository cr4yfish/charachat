"use server";

import CharacterCard from "@/components/character/CharacterCard";
import GeneralSwiper from "@/components/homepage/GeneralSwiper";
import InfiniteSwiperLoaderFallback from "@/components/InfiniteSwiperLoaderFallback";
import PersonaCard from "@/components/persona/PersonaCard";
import StoryCard from "@/components/story/StoryCard";
import { getUserCharacters } from "@/functions/db/character";
import { getUserPersonas } from "@/functions/db/personas";
import { getUserStories } from "@/functions/db/stories";
import { Suspense } from "react";

export default async function Page() {

    return (
        <>
        <h1 className="text-2xl font-bold">Hi there</h1>

        <div className="flex flex-col gap-2 w-full relative">
            <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
                <h2 className="dark:prose-invert text-lg font-bold">Your Characters</h2>
            </div>
            <Suspense fallback={<InfiniteSwiperLoaderFallback rows={4} />}>
                <GeneralSwiper loader={getUserCharacters} component={CharacterCard} rows={4} />
            </Suspense>
        </div>

        <div className="flex flex-col gap-2 w-full relative">
            <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
                <h2 className="dark:prose-invert text-lg font-bold">Your Stories</h2>
            </div>
            <Suspense fallback={<InfiniteSwiperLoaderFallback rows={2} />}>
                <GeneralSwiper loader={getUserStories} component={StoryCard} rows={2} />
            </Suspense>
        </div>


        <div className="flex flex-col gap-2 w-full relative">
            <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
                <h2 className="dark:prose-invert text-lg font-bold">Your Personas</h2>
            </div>
            <Suspense fallback={<InfiniteSwiperLoaderFallback rows={1} />}>
                <GeneralSwiper loader={getUserPersonas} component={PersonaCard} rows={1} />
            </Suspense>
        </div>

        </>
    )
}