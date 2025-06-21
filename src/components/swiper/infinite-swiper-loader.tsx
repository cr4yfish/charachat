/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { LoadMoreProps } from '@/types/db';
import { JSONObject } from '@ai-sdk/provider';
import useSWRInfinite from "swr/infinite";
import { fetcher } from '@/lib/utils';
import { TIMINGS_MILLISECONDS } from '@/lib/timings';

interface Props {
    loadMore?: (props : LoadMoreProps) => Promise<any[]>;
    apiUrl: string;
    limit: number;
    initialData: Array<any>;
    component: React.FC<any>;
    componentProps?: any;
    args?: JSONObject;
    rows?: number;
    scrollThreshold?: {
        pixels?: number;
        percent?: number; // 0-1
        adaptive?: boolean; // auto-adjust for device type
    };
}

const PureInfiniteSwiperLoader = (props: Props) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const {
        data,
        isLoading,
        isValidating,
        size,
        setSize,
    } = useSWRInfinite<any[]>(
        (pageIndex, prevPageData) => {
            if(prevPageData && !prevPageData.length) return null; // reached the end
            const cursor = pageIndex * props.limit;
            return props.apiUrl + `?cursor=${cursor}&limit=${props.limit}` + (props.args ? `&args=${JSON.stringify(props.args)}` : '');
        },
        fetcher, {
            dedupingInterval: TIMINGS_MILLISECONDS.ONE_HOUR, // 1 hour
            focusThrottleInterval: TIMINGS_MILLISECONDS.ONE_MINUTE, // 1 hour
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
            revalidateOnMount: false,
            suspense: true,
            fallbackData: [props.initialData]
        },

    )

    const items = useMemo(() => {
        return data ? data.flat() : [];
    }, [data])

    /**
     * Calculates the scroll threshold based on the container's width and the provided configuration.
     */
    const getScrollThreshold = useCallback((clientWidth: number) => {
        const config = props.scrollThreshold || {};
        
        // Check if pixels or percent are provided, otherwise use adaptive behavior
        if (config.pixels) {
            return Math.max(Math.max(config.pixels, 1), clientWidth * 0.5);
        }
        
        // If percent is provided, calculate based on the client width
        if (config.percent) {
            return clientWidth * Math.min(Math.max(config.percent, 0.001), 0.5);
        }
        
        // If adaptive is true or not specified, use adaptive behavior
        // This is the default behavior if no other options are provided
        if (config.adaptive !== false) {
            // Default adaptive behavior
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            return isTouchDevice 
                ? Math.max(clientWidth * 0.5, 500) 
                : Math.max(clientWidth * 0.1, 500);
        }
        
        // Fallback default
        // Only used if no other options are provided and adaptive is false
        return 50;
    }, [props.scrollThreshold]);

    /**
     * Handles the scroll event to load more data when the user scrolls near the end of the container.
     * It checks if the container is currently loading or validating to prevent multiple calls.
     */
    const handleScroll = useCallback(async () => {
        // Check if we are already loading or validating to prevent multiple calls
        if(isLoading || isValidating || !containerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        const threshold = getScrollThreshold(clientWidth);
        if (scrollLeft + clientWidth >= scrollWidth - threshold) {
            setSize(prevSize => prevSize + 1);
        }
        
    }, [setSize, isLoading, isValidating, getScrollThreshold]);

    // load more data on scrolling to end
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [size, isLoading, items, props, handleScroll]);
    
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
        <ScrollArea asChild className='overwrite-overflow' >
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

const InfiniteSwiperLoader = memo(PureInfiniteSwiperLoader, (prevProps, nextProps) => {
    // Prevent re-render if the props are the same
    return (
        prevProps.apiUrl === nextProps.apiUrl &&
        prevProps.limit === nextProps.limit &&
        JSON.stringify(prevProps.args) === JSON.stringify(nextProps.args) &&
        prevProps.component === nextProps.component &&
        prevProps.componentProps === nextProps.componentProps &&
        prevProps.rows === nextProps.rows &&
        prevProps.scrollThreshold === nextProps.scrollThreshold
    );
});

export default InfiniteSwiperLoader;