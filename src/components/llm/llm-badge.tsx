"use client";

import { LLM } from "@/lib/ai/models/llm";
import { memo } from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type Props  ={
    llm: LLM;
    isActive?: boolean;
}

const PureLLMBadge = (props: Props) => {
    return (
        <Badge
            className={cn(" bg-transparent text-muted-foreground border-border ", {
                "bg-emerald-400 text-emerald-900": props.isActive,
            })}
        >
            {props.llm.name}
        </Badge>
    )
}

const LLMBadge = memo(PureLLMBadge);

export default LLMBadge;