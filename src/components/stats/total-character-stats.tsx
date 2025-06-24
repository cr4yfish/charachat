"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { TIMINGS_MILLISECONDS } from "@/lib/constants/timings";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { Stats } from "@/types/db";



export default function TotalCharacterStats() {
    const { data } = useSWR<Stats>(API_ROUTES.GET_TOTAL_CHARACTER_STATS, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_DAY
    })
    
    return (
        <div className="flex flex-col gap-2">
            <Card className="!w-[240px] !h-[80px] flex flex-col gap-0 py-3  rounded-3xl ">
                <CardHeader className="pb-0">
                    <CardDescription>Total number of Characters</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-bold capitalize">{data?.count?.toLocaleString()}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}