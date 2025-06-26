"use client";

import Link from "next/link";
import { Button } from "../button";
import { ChevronLeftIcon } from "lucide-react";


export default function SearchTopBar() {

    return (
        <div className="relative size-full px-4 py-2 ios-safe-header-padding  flex items-center gap-1 overflow-hidden md:hidden">
            <Link href={"/"} className="flex flex-row items-center gap-1">
                <Button size={"icon"} variant={"ghost"} className="cursor-pointer">
                        <ChevronLeftIcon size={12} />
                </Button>
            </Link>
            <span className="text-3xl font-bold font-leckerli">
                Search
            </span> 
            <div className="absolute top-0 left-0 -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>
        </div>
    );
}