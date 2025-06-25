"use client";

import { CompassIcon, HomeIcon, MessageCircleIcon, SearchIcon } from "lucide-react";
import { Tab, TabBar } from "./tab-bar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useSidebar } from "../sidebar";
import { useMemo } from "react";

export type NavItem = {
    name: string;
    href: string;
    icon: React.ReactNode;
}

export const tabs: NavItem[] = [
    { name: "Explore", href: "/", icon:  <CompassIcon />},
    { name: "Chats", href: "/chats", icon: <MessageCircleIcon /> },
    { name: "Home", href: "/home", icon: <HomeIcon /> }
]

const disabledPaths = ["/chat", "/search", "/edit"];

function checkIsPathDisabled(pathname: string, disabledPaths: string[]): boolean {
    return disabledPaths.some(path => {
        if (path.endsWith('/')) {
            return pathname.startsWith(path);
        }
        return pathname.includes(path);
    });
}

export function AppTabBar() {
    const pathname = usePathname();
    const { isMobile } = useSidebar();

    const isPathDisabled = useMemo(() => {
        return checkIsPathDisabled(pathname, disabledPaths);
    }, [pathname]);

    if(!isMobile) return null; // Hide tab bar on desktop

    return (
        <motion.div 
            initial={{ bottom: "-90px" }}
            animate={ isPathDisabled ? { bottom: "-120px"} : { bottom: "0px" }}
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