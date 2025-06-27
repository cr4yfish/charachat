"use client";

import { cn } from "@/lib/utils";
import { Character } from "@/lib/db/types/character";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeftIcon, EditIcon, MessageCircleIcon } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { useRouter } from "next/navigation";


export default function CharacterTopHeader({ character, isOwner } : { character: Character, isOwner?: boolean }) {
    const { isMobile } = useSidebar();
    const router = useRouter();

    return (
        <div className={cn("fixed top-0 left-0 w-full min-h-[75px] bg-gradient-to-b from-black/50 to-transparent z-50", { "ml-[260px] pr-[280px]": !isMobile })}>
            <div className="relative size-full px-4 py-2 ios-safe-header-padding  flex items-center justify-between overflow-hidden">
                <Link href={"/"} onClick={(e) => {
                    e.preventDefault();
                    router.back();
                }} className="flex flex-row items-center gap-1">
                    <Button size={"icon"} variant={"ghost"} className="cursor-pointer">
                        <ChevronLeftIcon size={12} />
                    </Button>
                </Link>
                <div className="flex flex-row gap-2 items-center justify-center">
                    {isOwner && 
                    <Link href={"/c/" + character.id + "/edit"}>
                        <Button>
                            <EditIcon />
                            <span>Edit Char</span> 
                        </Button>
                    </Link>
                    }
                    <Link href={"/chat?characterid=" + character.id}>
                        <Button>
                            <MessageCircleIcon />
                            <span>Start Chat</span> 
                        </Button>
                    </Link>
                </div>
                <div className="absolute top-0 left-0 -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>
            </div>
        </div>
    );
}