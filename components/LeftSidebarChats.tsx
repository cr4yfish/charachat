"use server";

import {
    SidebarContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar"
import SidebarChatListFallback from "./sidebar/SidebarChatListFallback";
import dynamic from "next/dynamic";
const SidebarChatListLoader = dynamic(() => import("./sidebar/SidebarChatListLoader"), { loading: () => <SidebarChatListFallback /> });

export default async function LeftSidebarChats() {

    return (
        <>
        <SidebarContent className="p-2">
            <SidebarGroupLabel className="text-lg font-bold">Chats</SidebarGroupLabel>
            <SidebarChatListLoader />
        </SidebarContent>
        </>
    )
}