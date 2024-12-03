"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LLMsWithAPIKeys, LLMType } from "@/lib/ai";
import { Profile } from "@/types/db";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

type Props = {
    onSelect: (value: string) => void,
    default?: string | undefined,
    user: Profile | undefined,
}

const LLMCard = (llm: LLMType) => (
    <Card className="h-[60px] p-0 m-0 w-full dark:bg-transparent dark:border-none">
        <CardHeader className=" m-0 p-0 w-full flex flex-col items-start justify-center h-full bg-transparent">
            <CardDescription>{llm.provider}</CardDescription>
            <CardTitle>{llm.name}</CardTitle>
        </CardHeader>
    </Card>
)

export default function LLMSelect(props: Props) {

    return (
        <Select 
            onValueChange={(value) => props.onSelect(value)}
            defaultValue={props.default}
        >
            <SelectTrigger className="w-[200px] h-[90px]">
                <SelectValue placeholder="Select an AI" />
            </SelectTrigger>
            <SelectContent>
                {LLMsWithAPIKeys(props.user).map((llm) => (
                    <SelectItem key={llm.key} value={llm.key}>
                        <LLMCard {...llm} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}