"use server"

import ChatCardSmallSkeleton from "../chat/ChatCardSmallSkeleton"

export default async function SidebarChatListFallback() {
    return (
        <>
        <div className="flex flex-col gap-2">
            {[...Array(15)].map((_, i) => (
                <ChatCardSmallSkeleton key={i} />
            ))}
        </div>
        </>
    )
}