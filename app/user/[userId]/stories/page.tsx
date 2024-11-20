"use server";

import StoryCard from "@/components/story/StoryCard";
import { getStories } from "@/functions/db/stories";
import { ScrollShadow } from "@nextui-org/scroll-shadow";

export default async function UserStories({ params: {  } } : { params: { userId: string } }) {

    const stories = await getStories();

    return (
        <>
        <div className="flex flex-col gap-4 px-4 py-6 pb-20 h-full w-full">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-4xl font-bold">Your Stories</h1>
                    <p>You can add new ones on Character pages</p>
                </div>

            </div>
            

            <ScrollShadow className="overflow-y-auto max-h-full pb-20">
                <div className="flex flex-col gap-2 h-fit relative">
                    {stories.map((story) => (
                        <StoryCard fullWidth hasLink key={story.id} story={story} />
                    ))}
                    {stories?.length == 0 && (
                        <div className="text-center text-lg font-bold text-slate-400">
                            You have no stories yet.
                        </div>
                    )}
                </div>
            </ScrollShadow>
        </div>
        </>
    )
}