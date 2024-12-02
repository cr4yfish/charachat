/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { useToast } from '@/hooks/use-toast';
import { LoadMoreProps } from '@/types/client';
import { JSONObject } from '@ai-sdk/provider';

interface Props {
    loadMore: (props : LoadMoreProps) => Promise<any[]>;
    limit: number;
    initialData?: Array<any>;
    component: React.FC<any>;
    componentProps?: any;
    args?: JSONObject;
    rows?: number;
}


export default function InfiniteSwiperLoader(props: Props) {
    const { toast } = useToast();
    const [items, setItems] = useState<any[]>(props.initialData ?? []);
    const [cursor, setCursor] = useState(props.initialData?.length ?? 0)
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [rowsArray, setRowsArray] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // load more data on scrolling to end
    useEffect(() => {
        const handleScroll = async () => {
            if (containerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 5) {
                    if(isLoading || !canLoadMore) return;
                    setIsLoading(true)
            
                    try {
                        const res = await props.loadMore({ cursor: cursor, limit: props.limit, args: props.args } )
                        
                        setCursor(prevCursor => prevCursor + res.length);
            
                        if(items) {
                            setItems(prevItems => [...prevItems, ...res]);
                        } else {
                            setItems(res);
                        }
            
                        if(res.length < props.limit) {
                            containerRef.current?.removeEventListener('scroll', handleScroll);
                            setCanLoadMore(false);
                        }
            
                    } catch(error) {
                        const err = error as Error;
                        toast({
                            title: "Error",
                            description: err.message,
                            variant: "destructive"
                        })
                    }
                    
                    setIsLoading(false);
                };
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [canLoadMore, cursor, isLoading, items, props, toast]);

    useEffect(() => {
        const rows = props.rows ?? 1;
        const columns = Math.ceil(items.length / rows);
        const newRowsArray = Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: columns }, (_, colIndex) =>
                items[rowIndex + colIndex * rows]
            ).filter(item => item !== undefined)
        );
        setRowsArray(newRowsArray);
    }, [props.rows, items])

    return (
        <ScrollArea asChild >
            <ScrollShadow 
                orientation={"horizontal"}
                className="overflow-x-auto w-full"
                ref={containerRef}
            >
                <div className="w-fit flex flex-col gap-2 pr-10 pb-2" >
                    {rowsArray.map((rowItems, rowIndex) => (
                        <div key={rowIndex} className="flex flex-row flex-nowrap gap-2 relative w-fit">
                            {rowItems.map((item: any, index: number) => (
                                <props.component key={index} data={item} {...props.componentProps} />
                            ))}
                            {isLoading && <Skeleton className=' w-[300px] relative min-h-full rounded-lg' />}
                        </div>
                    ))}
                    
                </div>
            </ScrollShadow>
        </ScrollArea>
    );
}