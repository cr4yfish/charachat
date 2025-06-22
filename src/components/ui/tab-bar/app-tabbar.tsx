"use client";

import { CompassIcon, HomeIcon, MessageCircleIcon, SearchIcon } from "lucide-react";
import { Tab, TabBar } from "./tab-bar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const tabs = [
    { name: "Explore", href: "/", icon:  <CompassIcon />},
    { name: "Chats", href: "/chats", icon: <MessageCircleIcon /> },
    { name: "Home", href: "/home", icon: <HomeIcon /> }
]

export function AppTabBar() {
    const pathname = usePathname();

    return (
        <motion.div 
            initial={{ bottom: "-90px" }}
            animate={ (pathname === "/chat" || pathname.includes("/chat/") || pathname === "/search") ? { bottom: "-120px"} : { bottom: "0px" }}
            exit={{ bottom: "-90px" }}
            className={cn("transition all flex items-center justify-center gap-2 w-full h-[60px] fixed bottom-0 left-0 z-50")}
        >
            <TabBar>
                {tabs.map((tab) => (
                    <Tab 
                        key={tab.name} 
                        name={tab.name}
                        icon={tab.icon}
                        href={tab.href}
                        pathname={pathname}
                    />
                ))}
            </TabBar>

            <TabBar>
                <Tab 
                    icon={<SearchIcon />}
                    href="/search"
                    isButton
                />
            </TabBar>
         </motion.div>
    )
}