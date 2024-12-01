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
    const [rowsArray, setRowsArray] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = async () => {
        if(isLoading) return;
        setIsLoading(true)

        try {
            const res = await props.loadMore({ cursor: items?.length ?? 0, limit: props.limit, args: props.args } )
            if(items) {
                setItems([...items, ...res]);
            } else {
                setItems(res);
            }

            if(res.length < props.limit) {
                containerRef.current?.removeEventListener('scroll', handleScroll);
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
    }

    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                handleLoadMore();
            };
            
        }
    };

    // load more data on scrolling to end
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        const itemsPerRow = Math.ceil(items.length / (props.rows ?? 1));
        setRowsArray(Array.from({ length: props.rows ?? 1 }, (_, rowIndex) =>
            items.slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow)
        ));
    }, [props.rows, items])

    useEffect(() => {
        console.log(rowsArray);
    }, [rowsArray])

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