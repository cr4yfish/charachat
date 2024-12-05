"use server";

import { Skeleton } from "../ui/skeleton";



export default async function PublicProfileFallback() {
    
    return (
        <>
        <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-[200px] h-[200px] rounded-full" />
            <Skeleton className="h-[32px] w-[150px]" />
        </div>
        </>
    )
}