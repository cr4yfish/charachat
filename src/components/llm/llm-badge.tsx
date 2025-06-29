"use client";

import { LLM } from "@/lib/ai/models/llm";
import { memo } from "react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ImageModel } from "@/lib/ai/models/image";
import { ImageIcon, MessageCircleIcon } from "lucide-react";

type Props  ={
    llm: LLM | ImageModel;
    isActive?: boolean;
    type?: "text" | "image";
}

const PureLLMBadge = (props: Props) => {
    return (
        <Badge
            className={cn(" bg-transparent text-muted-foreground border-border ", {
                "bg-emerald-400 text-emerald-900": props.isActive,
            })}
        >
            {props.type === "image" && (
                <ImageIcon />
            )}
            {props.type === "text" && (
                <MessageCircleIcon />
            )}
            {props.llm.name}
        </Badge>
    )
}

const LLMBadge = memo(PureLLMBadge);

export default LLMBadge;