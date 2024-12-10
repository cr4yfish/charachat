"use server";

import { LoadMoreProps } from "@/types/client";
import { Chat } from "@/types/db";
import InfiniteSwiperLoader from "../InfiniteSwiperLoder";
import ChatCard from "../chat/ChatCard";

type Props = {
    loader: (props: LoadMoreProps) => Promise<Chat[]>;
    rows?: number; 
}

export default async function ChatSwiper(props: Props) {
        
    const defaultLoad: LoadMoreProps = {
        cursor: 0,
        limit: 6*(props.rows ?? 3),
    }

    let chats: Chat[] = [];
    
    try {
        chats = await props.loader(defaultLoad);
    } catch (e) {
        console.error(e);
        return (
            <>
            <h1>Something went wrong loading Characters</h1>
            </>
        )
    }

    return (
        <>
        <InfiniteSwiperLoader 
            loadMore={props.loader} 
            limit={15} 
            rows={props.rows ?? 3}
            initialData={chats} 
            component={ChatCard}
            componentProps={{
            hasLink: true,
            }}
        />
        </>
    )
}