"use server";

import { LoadMoreProps } from "@/types/client";
import { Story } from "@/types/db";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import StoryCard from "../story/StoryCard";

type Props = {
    loader: (props: LoadMoreProps) => Promise<Story[]>;
    rows?: number; 
}

export default async function StoriesSwiper(props: Props) {
        
    const defaultLoad: LoadMoreProps = {
        cursor: 0,
        limit: 16,
    }

    let stories: Story[] = [];
    
    try {
        stories = await props.loader(defaultLoad);
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
            loadMore={props.loader} 
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