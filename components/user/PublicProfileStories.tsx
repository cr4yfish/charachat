"use server";

import { getPublicUserStories } from "@/functions/db/stories";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import StoryCard from "../story/StoryCard";

type Props = {
    userId: string
}

export default async function PublicProfileStories(props:Props) {

    const initStories = await getPublicUserStories({ limit: 20, cursor: 0, args: { userId: props.userId } });

    return (
        <>
        <InfiniteSwiperLoader 
            initialData={initStories}
            limit={20}
            loadMore={getPublicUserStories}
            args={{ userId: props.userId }}
            rows={2}
            component={StoryCard}
            componentProps={{ hasLink: true }}
        />
        </>
    )
}