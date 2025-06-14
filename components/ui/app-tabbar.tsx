"use client";

import { CompassIcon, HeartIcon, HomeIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import { TabBar, Tab } from "./tabbar";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const tabs = [
    { name: "Explore", href: "/", icon:  <CompassIcon />},
    { name: "Chats", href: "/chats", icon: <MessageCircleIcon /> },
    { name: "Profile", href: "/profile", icon: <HeartIcon /> }
]

export function AppTabBar() {
    const pathname = usePathname();
    const activeTab = useMemo(() => tabs.find(tab => pathname.startsWith(tab.href)) || tabs[0], [pathname]);


    return (
        <TabBar>
            {tabs.map((tab) => (
                <Tab 
                    key={tab.name} 
                    name={tab.name}
                    icon={tab.icon}
                    href={tab.href}
                    active={activeTab.name === tab.name}
                />
            ))}
        </TabBar>
    )
}