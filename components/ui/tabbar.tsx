"use client";

import * as React from "react";
import Icon from "../utils/Icon";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TabBarContext = {
    
}

const TabBarContext = React.createContext<TabBarContext | null>(null);

function useTabBar() {
    const context = React.useContext(TabBarContext);
    if (!context) {
        throw new Error("useTabbar must be used within a TabbarProvider");
    }
    return context;
}

const TabBarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(
    (
        {
            children,
            ...props
        },
        ref
    ) => {

        const contextValue = React.useMemo<TabBarContext>(() => ({}), []);
    
        return (
            <TabBarContext.Provider value={contextValue}>
                {children}
            </TabBarContext.Provider>
        )
    }
)

TabBarProvider.displayName = "TabBarProvider";

const TabBar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({
        children,
        ...props
    }, ref) => {
        return (
            <div className="flex items-center justify-center w-full h-[60px] fixed bottom-0 left-0 z-50">
                <div
                    ref={ref}
                    className="w-fit h-full border border-white/20 rounded-full flex items-center justify-center gap-1 p-1 mb-[28px] z-50"
                    {...props}
                >
                    {children}
                </div>
            </div>
        );
    }
);

TabBar.displayName = "TabBar";

type TabProps = React.ComponentProps<"div"> & {
    name?: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean
};

const Tab = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & TabProps>(
    ({
        children,
        ...props
    }, ref) => {


        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
        }

        return (
            <motion.li className=" list-none relative h-full " >
                <Link
                    onClick={handleClick} 
                    href={props.href} 
                >
                    <motion.div
                        className={cn("flex flex-col items-center justify-center gap-2 h-full p-2 px-4 z-10 text-white/90", { "text-blue-500": props.active })}
                    >
                        <div className="h-[10px] scale-75 ">{props.icon}</div>
                        <span className={cn("text-[12pt] ") } >{props.name}</span>
                    </motion.div>
                </Link>
                {props.active && <motion.div
                    layoutId="tab-indicator"
                    id="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-full bg-white/5 border border-white/20 rounded-full"
                ></motion.div>}
            </motion.li>
        );
    }
);
Tab.displayName = "Tab";

export {
    TabBarProvider,
    TabBar,
    Tab
}