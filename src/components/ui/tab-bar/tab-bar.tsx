"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Liquid } from "../liquid";

const TabBar = ({ children} : { children: React.ReactNode }) => {
    return (
        <Liquid
            className="w-fit h-full  rounded-full flex items-center justify-center gap-1 p-1 mb-[50px] z-50"
            glassContentClassNames={"flex items-center justify-center gap-1"}
        >
            {children}
        </Liquid>
    );
    
}

TabBar.displayName = "TabBar";

type TabProps = React.ComponentProps<"div"> & {
    name?: string;
    href: string;
    icon?: React.ReactNode;
    pathname?: string;
    isButton?: boolean;
    onClick?: () => void;
};

const PureTab = (props: TabProps) => {

    const isActive = React.useMemo(() => {
        return props.pathname === props.href;
    }, [props.pathname, props.href]);

    return (
        <motion.li className={cn("list-none relative h-full w-[85px]", { "w-[50px]": props.isButton })} >
            <Link
                href={props.href} 
            >
                <motion.div
                    className={cn("flex flex-col items-center justify-center gap-3 h-full p-2 px-4 z-20 relative text-white/90", { "text-sky-100": isActive, "p-0": props.isButton })}
                >
                    <div className={cn("h-[13px] scale-90 ", { "size-full flex items-center justify-center scale-100": props.isButton })}>{props.icon}</div>
                    {props.name && <span className={cn("text-[9pt] font-bold ") } >{props.name}</span>}
                </motion.div>
            </Link>
            {isActive && (props.isButton !== true) && <motion.div
                layoutId="tab-indicator"
                id="tab-indicator"
                className="absolute bottom-0 left-0 right-0 size-full bg-sky-900/20 shadow-2xl shadow-primary border border-primary/20 backdrop-blur rounded-full"
            ></motion.div>}
        </motion.li>
    );
}

PureTab.displayName = "Tab";

const Tab = React.memo(PureTab, (prev, next) => {
    return prev.pathname === next.pathname && prev.href === next.href && prev.name === next.name;
});

export {
    TabBar,
    Tab
}