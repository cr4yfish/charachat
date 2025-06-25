"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { Stats } from "@/lib/db/types";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import Spinner from "../ui/spinner";

export default function TotalCharacterStats() {
    const { data, isLoading } = useSWR<Stats>(API_ROUTES.GET_TOTAL_CHARACTER_STATS, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_DAY
    })
    
    return (
        <Link href={"/search"} className="h-[80px] w-[260px] shrink-0 flex flex-row justify-between items-center gap-2 rounded-3xl text-rose-900 bg-rose-400 p-4 cursor-pointer hover:bg-rose-500 transition-all duration-200">
            <div className="flex flex-col gap-1">
                <p className="text-xs">Wanna see more?</p>
                <div className="flex items-center gap-1">
                    <h2 className="font-bold flex items-center gap-2">Browse {isLoading ? <Spinner/> : data?.count} Chars</h2>
                </div>
                
            </div>
            <div className="flex items-center self-end ">
                <ArrowRightIcon color="currentColor" className="self-end" />
            </div>
        </Link>
    );
}