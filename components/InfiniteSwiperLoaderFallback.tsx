"use client";

import { Skeleton } from "./ui/skeleton";

type Props = {
    rows: number;
}

export default function InfiniteSwiperLoaderFallback(props: Props) {

    return (
        <>
        <div className="flex flex-col gap-2">
            {[...Array(props.rows)].map((_, i) => (
                <div key={i} className="flex flex-row gap-2 items-center">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Skeleton key={i} className="h-[150px] min-w-[310px] rounded-xl" />
                    ))}
                </div>
            ))}
        </div>
        </>
    )
}