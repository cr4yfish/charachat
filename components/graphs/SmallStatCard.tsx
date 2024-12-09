"use client";

import { Stats } from "@/types/db";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";

type Props = {
    data: Stats[];
    description: string;
}

export default function SmallStatCard(props: Props) {

    return (
        <>
        <Card className="!w-[240px] !h-[120px] bg-white/40 dark:bg-zinc-900/20 ">
            <CardHeader className="pb-2">
                <CardDescription>{props.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-0">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-4xl font-bold">{props.data[0].count?.toLocaleString()}</h1>
                    <h1 className="text-2xl font-bold text-gray-400">{props.data[0].accumulated_count?.toLocaleString()}</h1>
                </div>
            </CardContent>
        </Card>
        </>
    )
}