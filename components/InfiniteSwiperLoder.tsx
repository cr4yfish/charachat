/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';

import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ScrollShadow } from '@nextui-org/scroll-shadow';
import { Spinner } from '@nextui-org/spinner';
import { useToast } from '@/hooks/use-toast';

interface Props {
    loadMore: (cursor: number, limit: number) => Promise<any[]>;
    limit: number;
    initialData?: Array<any>;
    component: React.FC<any>;
    componentProps?: any;
}


export default function InfiniteSwiperLoader(props: Props) {
    const { toast } = useToast();
    const [items, setItems] = useState<any[]>(props.initialData ?? []);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = async () => {
        if(isLoading) return;
        setIsLoading(true)

        try {
            const res = await props.loadMore(items?.length ?? 0, props.limit)
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

    // Load more data until container has overflow
    useEffect(() => {
        if(containerRef.current) {
            const container = containerRef.current;
            if (!(container.scrollWidth > container.clientWidth)) {
                handleLoadMore();
            }
        }
    }, [containerRef.current?.scrollWidth])

    return (
        <ScrollArea asChild >
            <ScrollShadow 
                orientation={"horizontal"}
                className="overflow-x-auto w-full"
                ref={containerRef}
            >
                <div
                
                className="w-fit flex flex-row gap-4 pr-10 pb-4"
                >
                    {items?.map((item, index) => (
                        <props.component key={index} data={item} {...props.componentProps} />
                    ))}
                    {isLoading && <Spinner />}
                </div>
            </ScrollShadow>
        </ScrollArea>
    );
}