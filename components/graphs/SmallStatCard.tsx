"use client";

import { Stats } from "@/types/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

type Props = {
    data: Stats[];
    title: string;
    description: string;
}

export default function SmallStatCard(props: Props) {

    return (
        <>
        <Card className="!w-[240px] !h-[155px]">
            <CardHeader>
                <CardDescription>{props.description}</CardDescription>
                <CardTitle>{props.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-4xl font-bold">{props.data[0].count?.toLocaleString()}</h1>
                    <h1 className="text-2xl font-bold text-gray-400">{props.data[0].accumulated_count?.toLocaleString()}</h1>
                </div>
            </CardContent>
        </Card>
        </>
    )
}