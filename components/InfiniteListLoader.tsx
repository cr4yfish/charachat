/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@nextui-org/spinner";
import { LoadMoreProps } from "@/types/client";


interface Props {
    loadMore: (props: LoadMoreProps) => Promise<any[]>;
    limit: number;
    initialData: Array<any>;
    component: React.FC<any>;
    scrollerProps?: React.ComponentPropsWithoutRef<typeof InfiniteScroll>
    componentProps?: any;
    skeleton?: any
}


export default function InfiniteListLoader(props: Props) {
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(props.initialData.length);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(props.initialData);
    const { toast } = useToast();

    const handleLoadMore = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const res = await props.loadMore({ cursor, limit: props.limit });
            setCursor(cursor + res.length);
            setData([...data, ...res]);

            if (res.length < props.limit) {
                setHasMore(false);
            }

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load more data",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="h-full overflow-y-scroll">
            <InfiniteScroll
                className="overflow-hidden h-fit flex flex-col gap-2"
                useWindow={false}
                pageStart={0}
                loadMore={async() => await handleLoadMore()}
                hasMore={hasMore}
                loader={<div key={0}>{ isLoading && (props.skeleton ? props.skeleton : <Spinner />)}</div>}
                initialLoad={false}
            >
                {data.map((item, index) => (
                    <props.component key={index} data={item} {...props.componentProps} />
                ))}
            </InfiniteScroll>
        </div>
    )
}