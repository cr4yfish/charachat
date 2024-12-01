"use server";

import { Skeleton } from "../ui/skeleton";

export default async function ChatCardSmallSkeleton() {
    
    return (
        <div className="flex flex-row min-w-full h-[64px] gap-2 p-2">
            <Skeleton className="rounded-full h-[40px] min-w-[40px]" />
            <div className="flex flex-col w-full gap-1">
                <Skeleton className="rounded-lg h-[20px] min-w-full" />
                <Skeleton className="rounded-lg h-[15px] min-w-full" />
            </div>
        </div>
        
    )
}