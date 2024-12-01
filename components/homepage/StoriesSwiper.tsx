"use server";

import { LoadMoreProps } from "@/types/client";
import { Story } from "@/types/db";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import StoryCard from "../story/StoryCard";
import { getStories } from "@/functions/db/stories";

export default async function StoriesSwiper() {
        
    const defaultLoad: LoadMoreProps = {
        cursor: 0,
        limit: 15,
    }

    let stories: Story[] = [];
    
    try {
        stories = await getStories(defaultLoad);
    } catch (e) {
        console.error(e);
        return (
            <>
            <h1>Something went wrong loading popular Characters</h1>
            </>
        )
    }

    return (
        <>
        <InfiniteSwiperLoader 
            loadMore={getStories} 
            limit={15} 
            rows={2}
            initialData={stories} 
            component={StoryCard}
            componentProps={{
            hasLink: true,
            }}
        />
        </>
    )
}