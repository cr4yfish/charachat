"use server";

import CharacterCard from "@/components/character/CharacterCard";
import SmallStatCard from "@/components/graphs/SmallStatCard";
import { StatsCard } from "@/components/graphs/StatsCard";
import GeneralSwiper from "@/components/homepage/GeneralSwiper";
import InfiniteSwiperLoaderFallback from "@/components/InfiniteSwiperLoaderFallback";
import PersonaCard from "@/components/persona/PersonaCard";
import StoryCard from "@/components/story/StoryCard";
import { getUserCharacters } from "@/functions/db/character";
import { getUserPersonas } from "@/functions/db/personas";
import { getOwnLeaderboardPosition, getStats } from "@/functions/db/stats";
import { getUserStories } from "@/functions/db/stories";
import { Suspense } from "react";

export default async function Page() {
    
    const stats = await getStats("creator_chat_stats")
    const mostPopularCharacter = await getUserCharacters({limit: 1, cursor: 0, args: {sort: "chats"}})
    const leaderboardPosition = await getOwnLeaderboardPosition()

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

        <div className="flex flex-col gap-2 w-full relative">
            <div className="prose dark:prose-invert prose-p:m-0 prose-h2:m-0">
                <h2 className="dark:prose-invert text-lg font-bold">Creator Statistics</h2>
            </div>
            <div className="flex flex-row items-center gap-2 overflow-x-auto w-full">
                <StatsCard 
                    stats={stats}
                    title="New chats with your Characters per day"
                    description=""
                    interval="daily"
                />
            </div>
            <div className="flex items-center gap-2 w-full overflow-x-auto">
                <SmallStatCard 
                    title={mostPopularCharacter[0].name}
                    description={"Most popular Character"}
                    count={mostPopularCharacter[0].chats + " chats"}
                />
                <SmallStatCard 
                    description={"Position in Leaderboard"}
                    count={leaderboardPosition.position}
                />
            </div>

        </div>

        </>
    )
}