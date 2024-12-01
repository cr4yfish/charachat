"use server"

import { Skeleton } from "../ui/skeleton"

export default async function SidebarChatListFallback() {
    return (
        <>
        <div className="flex flex-col gap-2">
            {[...Array(15)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
        </>
    )
}