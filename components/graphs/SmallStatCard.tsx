"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

type Props = {
    title?: string;
    description: string;
    count?: number | string;
    accumulated_count?: number;
}

export default function SmallStatCard(props: Props) {

    return (
        <>
        <Card className="!w-[240px] !h-[120px] bg-white/40 dark:bg-zinc-900/20 ">
            <CardHeader className="pb-2">
            <CardDescription>{props.description}</CardDescription>
                {props.title && <CardTitle>{props.title}</CardTitle>}
            </CardHeader>
            <CardContent className="pt-0 pb-0">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-bold capitalize">{props.count?.toLocaleString()}</h1>
                    <h1 className="text-2xl font-bold text-gray-400 ">{props.accumulated_count?.toLocaleString()}</h1>
                </div>
            </CardContent>
        </Card>
        </>
    )
}