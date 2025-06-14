"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useToast } from '@/hooks/use-toast';
import { LoadMoreProps } from '@/types/client';
import { JSONObject } from '@ai-sdk/provider';
import useSWRInfinite from "swr/infinite";
import { fetcher } from '@/lib/utils';

interface Props {
    loadMore?: (props : LoadMoreProps) => Promise<any[]>;
    apiUrl: string;
    limit: number;
    initialData?: Array<any>;
    component: React.FC<any>;
    componentProps?: any;
    args?: JSONObject;
    rows?: number;
}


export default function InfiniteSwiperLoader(props: Props) {
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {
        data,
        isLoading,
        isValidating,
        error,
        size,
        setSize,
        mutate
    } = useSWRInfinite<any[]>(
        (pageIndex, prevPageData) => {
            if(prevPageData && !prevPageData.length) return null; // reached the end
            return props.apiUrl + `?cursor=${pageIndex}&limit=${props.limit}` + (props.args ? `&args=${JSON.stringify(props.args)}` : '');
        },
        fetcher, {
            dedupingInterval: 60*60*1000, // 1 hour
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            suspense: true,
            fallbackData: []
        },
    )

    const items = useMemo(() => {
        return data ? data.flat() : [];
    }, [data])

    const handleScroll = useCallback(async () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                setSize(prevSize => prevSize + 1);
            }
        }
    }, [setSize])

    // load more data on scrolling to end
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [size, isLoading, items, props, toast]);
    
    const rowsArray = useMemo(() => {
        const rows = props.rows ?? 1;
        const columns = Math.ceil(items.length / rows);
        return Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: columns }, (_, colIndex) =>
                items[rowIndex + colIndex * rows]
            ).filter(item => item !== undefined)
        );
    }, [props.rows, items]);

    return (
        <ScrollArea asChild >
            <div 
                className="overflow-x-auto w-full"
                ref={containerRef}
            >
                <div className="w-fit flex flex-col gap-2 pr-10 pb-2" >
                    {rowsArray.map((rowItems, rowIndex) => (
                        <div key={rowIndex} className="flex flex-row flex-nowrap gap-2 relative w-fit">
                            {rowItems.map((item: any, index: number) => (
                                <props.component key={index} data={item} {...props.componentProps} />
                            ))}
                            {(isLoading || isValidating || items.length == 0) && <Skeleton className=' w-[300px] relative min-h-full rounded-lg' />}
                        </div>
                    ))}
                    
                </div>
            </div>
        </ScrollArea>
    );
}