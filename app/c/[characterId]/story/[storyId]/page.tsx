"use server";

import CharacterCard from "@/components/character/CharacterCard";
import { getStory } from "@/functions/db/stories";
import Image from "next/image";
import { Button } from "@/components/utils/Button";
import { getCurrentUser } from "@/functions/db/auth";
import Link from "next/link";
import StartStoryButton from "@/components/story/StartStoryButton";
import { Profile } from "@/types/db";


export default async function Story({ params: { storyId, characterId } }: { params: { storyId: string, characterId: string } }) {

    let profile: Profile | undefined = undefined;

    try {
        profile = await getCurrentUser();
    } catch (error) {
        const err = error as Error;
        if(err.message == "No user found") return; // This is not an issue
        console.error(error);
    }

    const story = await getStory(storyId);

    return (
        <>
        <div className="flex flex-col gap-2 relative px-4 py-6 pb-32">

            <div className="absolute -z-10 left-0 -top-12 w-full h-[66vh]">
                <Image src={story.image_link} layout="fill" objectFit="cover" alt={story.title} />
            </div>
            
            <div className="flex flex-col gap-2 pt-[45vh]">

                <h1 className="font-bold text-2xl">{story.title}</h1>
                
                <CharacterCard fullWidth character={story.character} hasLink />

                <div className="relative w-full flex gap-2 items-center justify-center py-4">
                    <StartStoryButton story={story} profile={profile} />
                    {profile?.user == story.creator.user && 
                        <Link href={`/c/${characterId}/story/${storyId}/edit`}><Button fullWidth size="lg" color="warning" variant="flat">Edit</Button></Link> 
                    }
                </div>

                <div className="prose dark:prose-invert">
                    <h2 className="text-2xl font-bold">Story Details</h2>
                    <h3>Description</h3>
                    <p>{story.description}</p>

                    <h3>Story</h3>
                    <p>{story.story}</p>

                    <h3>First Message</h3>
                    <p>{story.first_message}</p>
                </div>
            </div>

        </div>
        </>
    )
}