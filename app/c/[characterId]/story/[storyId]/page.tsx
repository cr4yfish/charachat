"use server";

import { Spacer } from "@nextui-org/spacer"

import CharacterCard from "@/components/character/CharacterCard";
import BackLink from "@/components/utils/BackLink";
import { getCharacter } from "@/functions/db/character";
import { getStory } from "@/functions/db/stories";
import Image from "next/image";
import { Button } from "@/components/utils/Button";
import { getCurrentUser } from "@/functions/db/auth";
import Link from "next/link";
import StartStoryButton from "@/components/story/StartStoryButton";


export default async function Story({ params: { storyId, characterId } }: { params: { storyId: string, characterId: string } }) {

    const profile = await getCurrentUser();
    const story = await getStory(storyId);

    return (
        <>
         <div className="z-20 absolute bottom-0 left-0 w-full flex gap-1 items-center justify-center pb-5 px-4">
            <StartStoryButton story={story} profile={profile} />
            {profile.user == story.creator.user && 
                <Link href={`/c/${characterId}/story/${storyId}/edit`}><Button fullWidth size="lg" color="warning" variant="shadow">Edit Story</Button></Link> 
            }
        </div>

        <div className="flex flex-col gap-2 relative px-4 py-6">

            <div className="flex items-center gap-2">
                <BackLink />
            </div>

            <div className="absolute -z-10 top-0 left-0 w-full h-[66vh]">
                <Image src={story.image_link} layout="fill" objectFit="cover" alt={story.title} />
            </div>

   
            <Spacer y={56} />

            <h1 className="font-bold text-2xl">{story.title}</h1>
            
            <CharacterCard fullWidth character={story.character} hasLink />

            <Spacer />


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
        </>
    )
}