"use server";

import CharacterCard from "@/components/character/CharacterCard";
import { getStory } from "@/functions/db/stories";
import Image from "next/image";
import { Button } from "@/components/utils/Button";
import { getCurrentUser } from "@/functions/db/auth";
import Link from "next/link";
import StartStoryButton from "@/components/story/StartStoryButton";
import { Profile } from "@/types/db";
import Icon from "@/components/utils/Icon";

import { Metadata } from "next";
import { safeParseLink } from "@/lib/utils";
import CharacterAvatarButton from "@/components/character/CharacterAvatarButton";

type Params = Promise<{ storyId: string, characterId: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    const {storyId} = await params;
    try {
        const story = await getStory(storyId);

        return {
            title: `${story.title}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing Story`,
        }   
    }

}


export default async function Story({ params }: { params: Params }) {
    const { characterId, storyId } = await params;
    let profile: Profile | undefined = undefined;

    try {
        profile = await getCurrentUser();
    } catch (error) {
        const err = error as Error;
        // Anons are allowed here, not an error
        if(err.message !== "No user found") {
            console.error("Error in c/character/story", error);
        };
    }

    const story = await getStory(storyId);

    return (
        <>
        <div className="flex flex-col gap-2 relative px-4 py-6 pb-32">

            <div className="absolute -z-10 left-0 -top-12 w-full h-[66vh]">
                <Image src={safeParseLink(story.image_link)} layout="fill" className="object-cover" alt={story.title} />
            </div>
            
            <div className="absolute -z-20 left-0 w-full h-full blur-3xl opacity-50">
                <Image src={safeParseLink(story.image_link)} layout="fill" className="object-cover" alt={story.title} />
            </div>

            <div className="flex flex-col gap-2 pt-[45vh]">

                <h1 className="font-bold text-2xl">{story.title}</h1>
                
                <CharacterCard fullWidth data={story.character} hasLink />

                <div className="relative w-full flex gap-2 items-center justify-center py-4">
                    <StartStoryButton story={story} profile={profile} />
                    {profile?.user == story.creator.user && 
                        <Link href={`/c/${characterId}/story/${storyId}/edit`}><Button fullWidth size="lg" color="warning" variant="flat">Edit</Button></Link> 
                    }
                </div>

                <div className="prose dark:prose-invert">
                    <h2 className="text-2xl font-bold">Story Details</h2>
                    
                    {story.extra_characters &&
                    <>
                    <h3>Other Characters in this Story</h3>
                    <div className="w-full overflow-x-auto">
                        <div className="flex flex-row w-fit items-center">
                            {story.extra_characters?.map(charId => (
                                <CharacterAvatarButton 
                                    key={charId} 
                                    characterId={charId} 
                                    disableButton
                                    hasLink
                                />
                            ))}
                        </div>
                    </div>

                    <Spacer y={4} />
                    </>
                    }

                    <div className="flex flex-row gap-6 text-sm dark:text-zinc-200">
                        <div className="flex items-center gap-2">
                            <Icon downscale filled>chat_bubble</Icon>
                            <span>{story.chats} Chats</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Icon downscale filled>favorite</Icon>
                            <span>{story.likes} Likes</span>
                        </div>
                    </div>

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