"use server";

import InfiniteSwiperLoaderFallback from "@/components/InfiniteSwiperLoaderFallback";
import PublicProfile from "@/components/user/PublicProfile";
import PublicProfileCharacters from "@/components/user/PublicProfileCharacters";
import PublicProfileFallback from "@/components/user/PublicProfileFallback";
import PublicProfileStories from "@/components/user/PublicProfileStories";
import { getPublicProfile } from "@/functions/db/profiles";
import { Suspense } from "react";

type Params = Promise<{
    userId: string
}>

export async function generateMetadata(
    { params } : { params: Params }
) {
    const { userId } = await params;
    
    const profile = await getPublicProfile(userId);

    return {
        title: `Profile of ${profile.username}`
    }
}

export default async function PublicProfilePage({ params } : { params: Params }) {
    
    const { userId } = await params;

    return (
        <>
        <div className="flex flex-col gap-6 pt-10 px-4 pb-20">
            <Suspense fallback={<PublicProfileFallback />}>
                <PublicProfile userId={userId} />
            </Suspense>
            
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">Public Characters</h2>
                <Suspense fallback={<InfiniteSwiperLoaderFallback rows={2} />}>
                    <PublicProfileCharacters userId={userId} /> 
                </Suspense>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">Public Stories</h2>
                <Suspense fallback={<InfiniteSwiperLoaderFallback rows={2} />}>
                    <PublicProfileStories userId={userId} />
                </Suspense>
            </div>

            
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold">Public Personas</h2>
                <Suspense fallback={<InfiniteSwiperLoaderFallback rows={2} />}>
                    <PublicProfileStories userId={userId} />
                </Suspense>
            </div>
        </div>
        </>
    )
}