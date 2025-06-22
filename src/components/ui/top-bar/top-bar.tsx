"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeftIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { Button } from "../button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSidebar } from "../sidebar";

type TopBarAction = {
    
    /**
     * Icon to display in the top bar action.
     * This should be a React node, typically an icon component.
     */
    icon: React.ReactNode;

    /**
     * optional label for the action.
     * 
     * Will be hidden on mobile devices.
     */
    label?: string;

    href: string;

    /**
     * Determines if the action is active based on the current pathname.
     * If not provided, the action will not be considered active.
     */
    pathname?: string;
}

type TopBarTitle = {
    /**
     * The title to display in the top bar.
     * This is typically a string that represents the current page or section.
     */
    title: string;

    /**
     * Optional subtitle to provide additional context.
     */
    subtitle?: string;

    /**
     * Pathname to determine if the title is active.
     */
    pathname: string;

    /**
     * Optional image link to display an image in the top bar.
     * This can be used for branding or to represent the current page visually.
     */
    showBackButton?: boolean; // Whether to show the back button in the top bar
}

const titles: TopBarTitle[] = [
    { title: "Explore", pathname: "/" },
    { title: "Chats", pathname: "/chats" },
    { title: "Home", pathname: "/home" },
    { title: "New Character", pathname: "/c/new", showBackButton: true },
    { title: "Import Character", pathname: "/c/new/import", showBackButton: true },
    { title: "Settings", pathname: "/home/settings", showBackButton: true },
    { title: "Search", pathname: "/search", showBackButton: true },
    { title: "Your Characters", pathname: "/c/own", showBackButton: true },
];

const actions : TopBarAction[] = [
    {
        pathname: "/",
        icon: <PlusIcon color="currentColor" />,
        href: "/c/new",
        label: "Character",
    },
    {
        pathname: "/chats",
        icon: <PlusIcon color="currentColor" />,
        href: "/chat",
        label: "Chat",
    },
    {
        pathname: "/home",
        icon: <SettingsIcon color="currentColor" />,
        href: "/home/settings",
        label: "Settings",
    }
];

const PureTopBar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { open: sidebarOpen } = useSidebar();

    const activeTitle = React.useMemo(() => {
        return titles.find(title => title.pathname === pathname);
    }, [pathname]);

    const activeActions = React.useMemo(() => {
        return actions?.filter(action => action.pathname === pathname) || [];
    }, [pathname]);

    if (!activeTitle && activeActions.length === 0) {
        return null; // No active title or actions, nothing to render
    }
    
    return (
        <>
        <div className={cn("fixed z-50 top-0 left-0 h-[75px] ml-0 w-full px-4 py-2 transition-all overflow-hidden", {
            "bg-transparent":activeTitle === undefined,
            "ml-[260px]": sidebarOpen,
            "ml-[60px]": !sidebarOpen,
        })} >
            <div className={cn(" flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent w-full relative overflow-hidden ", {
                "pr-[260px] ": sidebarOpen,
                "pr-[60px]": !sidebarOpen,
            })}>
                <div className="flex flex-row items-center gap-1">
                    { activeTitle?.showBackButton &&
                        <Link href={"/"} onClick={(e) => {
                        e.preventDefault();
                        router.back();
                    }} className="flex flex-row items-center gap-1">
                        <Button size={"icon"} variant={"ghost"} className="cursor-pointer">
                            <ChevronLeftIcon size={12} />
                        </Button>
                    </Link>}

                    {activeTitle && 
                        <div className="flex flex-col">
                            <span className=" text-3xl font-bold " >{activeTitle?.title}</span>
                        </div>
                    }
                    
                </div>

    

                {activeActions.length > 0 &&
                    <div className="flex items-center gap-2 relative">
                        {activeActions.map((action) => (
                            <Link key={`top-bar-action-${action.pathname}-${action.icon}`} href={action.href} className=" cursor-pointer">
                                <Button className=" cursor-pointer" >
                                    {action.icon}
                                    {action.label && <span className="">{action.label}</span>}
                                </Button>
                            </Link>
                        ))}
                    </div>
                }

                {(activeTitle !== undefined) && <div className="absolute -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>}
            </div>
        </div>
        </>
    );
}

export const TopBar = React.memo(PureTopBar);
