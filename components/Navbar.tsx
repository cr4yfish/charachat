"use client";

import { Spacer } from "@nextui-org/spacer";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";

export default function Navbar() {
    const pathname = usePathname();

    // Dont render in a chat page
    if(pathname.includes("/chat/")) return <></>

    return (
        <>
        <div className="absolute top-0 left-0 w-full flex flex-row items-center justify-between px-4 pt-3 pb-2 backdrop-blur z-50">
            <div className="flex items-center gap-2">
                <SidebarTrigger><></></SidebarTrigger>
                <Link href={"/"}><span className="font-bold">charachat</span></Link>
            </div>
            
        </div>

        <Spacer y={12} />
        </>
    )
}