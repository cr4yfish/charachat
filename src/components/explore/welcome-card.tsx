"use client";

import { ArrowRightIcon } from "lucide-react";
import { CarouselItem } from "../ui/carousel";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";


function WelcomeCard() {
    const { isSignedIn } = useAuth();

    if(!isSignedIn) return null;

    return (
        <CarouselItem className="min-lg:basis-1/3">
            <Link href={"/home/settings/migrate"} className="w-full">
                <div className="flex flex-row justify-between items-center gap-2 rounded-3xl text-fuchsia-200/80 bg-fuchsia-800 p-4 cursor-pointer hover:bg-fuchsia-700 transition-all duration-200">
                    <div className="flex flex-col gap-1">
                        <p className="text-xs">Did you use Charachat v1?</p>
                        <div className="flex items-center gap-1">
                            <h2 className="font-bold text-white/90">Migrate your Account</h2>
                        </div>
                        
                    </div>
                    <div className="flex items-center self-end ">
                        <ArrowRightIcon color="currentColor" className="self-end" />
                    </div>
                </div>
            </Link>
        </CarouselItem>
    );
}

export default WelcomeCard;