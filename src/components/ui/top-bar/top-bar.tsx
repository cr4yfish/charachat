"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeftIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { Button } from "../button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSidebar } from "../sidebar";
import SearchCard from "@/components/search/search-card";

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

    showHomeButton?: boolean; // Whether to show the home button in the top bar
}

const titles: TopBarTitle[] = [
    { title: "Explore", pathname: "/" },
    { title: "Chats", pathname: "/chats" },
    { title: "Home", pathname: "/home" },
    { title: "New Char", pathname: "/c/new", showBackButton: true },
    { title: "Import Chars", pathname: "/c/new/import", showBackButton: true },
    { title: "Settings", pathname: "/home/settings", showBackButton: true },
    { title: "Your Chars", pathname: "/c/own", showBackButton: true },
    { title: "Your Personas", pathname: "/p/own", showBackButton: true },
    { title: "Migrate", pathname: "/home/settings/migrate", showBackButton: true },
    { title: "Fix encrypted data", pathname: "/home/settings/migrate/fix-encrypted-data", showBackButton: true },
    { title: "Leaderboard", pathname: "/leaderboard", showBackButton: true },
];

const actions : TopBarAction[] = [
    {
        pathname: "/",
        icon: <PlusIcon color="currentColor" />,
        href: "/c/new",
        label: "Character",
    },
    {
        pathname: "/",
        icon: <PlusIcon color="currentColor" />,
        href: "/chat",
        label: "Chat",
    },
    {
        pathname: "/c/own",
        icon: <PlusIcon color="currentColor" />,
        href: "/c/new",
    },
    {
        pathname: "/p/own",
        icon: <PlusIcon color="currentColor" />,
        href: "/p/new",
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
    const { isMobile } = useSidebar();

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
        <div className={cn("fixed z-50 top-0 left-0 ml-0 w-full transition-all overflow-hidden", {
            "bg-transparent":activeTitle === undefined,
            "ml-[255px]": !isMobile,
            // "ml-[60px]": !sidebarOpen  && !isMobile,
        })} >
            <div className={cn("bg-gradient-to-b from-black/50 to-transparent w-full relative overflow-hidden flex flex-row justify-center ", {
                "pr-[260px] ": !isMobile,
                // "pr-[60px]": !sidebarOpen  && !isMobile,
            })}>

                <div className="flex items-center justify-between px-4 py-2 ios-safe-header-padding   w-full relative max-w-[1920px]">
                    <div className="flex flex-row items-center gap-1">

                        { activeTitle?.showBackButton &&
                            <Link href={"/"} onClick={(e) => {
                            e.preventDefault();
                            router.back();
                        }} className="flex flex-row items-center gap-1">
                            <Button size={"icon"} variant={"ghost"} className="cursor-pointer">
                                <ChevronLeftIcon size={12} />
                            </Button>
                        </Link>
                        }

                        { activeTitle?.showHomeButton &&
                            <Link href={"/"} className="flex flex-row items-center gap-1">
                                <Button size={"icon"} variant={"ghost"} className="cursor-pointer">
                                     <ChevronLeftIcon size={12} />
                                </Button>
                            </Link>
                        }

                        {activeTitle && 
                            <div className="flex flex-col">
                                <span className=" text-3xl font-bold font-leckerli " >{activeTitle?.title}</span>
                            </div>
                        }
                        
                    </div>

                    {activeActions.length > 0 &&
                        <div className="flex items-center gap-2 relative">
                            {pathname === "/" && <SearchCard />}
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
                </div>
                {(activeTitle !== undefined) && <div className="absolute -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>}
                
            </div>
        </div>
        </>
    );
}

export const TopBar = React.memo(PureTopBar);
