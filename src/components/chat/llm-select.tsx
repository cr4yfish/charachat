"use client";

import { memo, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LLM, ModelId } from "@/lib/ai/types";
import { getLLMById, getLLMGroupedByProvider } from "@/lib/ai/utils";
import { cn, fetcher } from "@/lib/utils";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { _DEFAULT_LLM } from "@/lib/defaults";
import LLMIcon from "../llm/llm-icon";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/apiRoutes";

const PureFancyLLM = ({ llm, showIcon, showProvider }: { llm: LLM | undefined, showIcon?: boolean, showProvider?: boolean}) => {
    if(!llm) {
        return (
            <div className="flex flex-col gap-1 w-full">
                <span className="text-muted-foreground">LLM not found</span>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col justify-start gap-1 w-full">
            <div className="flex flex-col items-start gap-0.5">
                {showProvider && (
                    <>
                    <div className="flex flex-row items-center gap-1">
                        {showIcon && 
                            <LLMIcon provider={llm.provider} />
                        }
                        <span className="text-xs text-muted-foreground">{llm.provider}</span>
                    </div>
                    </>
                )}
                <span>
                    {llm.name} 
                </span> 
            </div>

            <div className="flex flex-row flex-wrap gap-1">
                {llm.tags?.map((tag, index) => (
                    <Badge 
                        variant={"outline"} 
                        key={index} 
                        className={cn("text-xs text-muted-foreground", {
                            "text-emerald-400 ": tag === "Free"
                        })}
                    >
                        {tag}
                    </Badge>
                ))}
            </div>
        </div>
    )
}

const FancyLLM = memo(PureFancyLLM, (prevProps, nextProps) => {
    if (prevProps.llm?.key !== nextProps.llm?.key) return false;
    if (prevProps.showProvider !== nextProps.showProvider) return false;
    if (prevProps.showIcon !== nextProps.showIcon) return false;

    return true;
});

type Props = {
    onSelect?: (key: ModelId) => void;
    selectedKey?: ModelId | undefined;
    label?: string;
    description?: string;
}

const PureLLMSelect = (props: Props) => {
    const { data: profile } = useSWR(API_ROUTES.GET_OWN_PROFILE, fetcher)

    const llmGroups = useMemo(() => {
        return getLLMGroupedByProvider(profile);
    }, [profile])

    return (
        <div className="flex flex-col gap-2">
            <Label className="flex flex-col items-start gap-1" htmlFor="llm-select">
                <span>{props.label || "Select a Model"}</span>
                <span className="text-xs text-muted-foreground">{props.description}</span>
            </Label>
            <Select name="llm-select" value={props.selectedKey}  >
                <SelectTrigger size={"removesizingcss"} className="h-fit rounded-2xl w-full border-border">
                    <SelectValue aria-label="Select a LLM" className="!h-fit !border-border">
                        <FancyLLM llm={getLLMById(props.selectedKey || _DEFAULT_LLM)} showIcon showProvider  />
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-background/80 backdrop-blur-xl">
                    {llmGroups?.map((group) => (
                        <SelectGroup key={group.provider}>
                            <SelectLabel className="flex flex-row items-center gap-1">
                                <LLMIcon provider={group.provider} />
                                {group.provider}
                            </SelectLabel>
                            {group.llms.map((llm) => (
                                <SelectItem
                                    key={llm.key}
                                    value={llm.name}
                                    onClick={() => props.onSelect?.(llm.key)}
                                >
                                    <FancyLLM llm={llm} />

                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
    </div>
    )
}


const LLMSelect = memo(PureLLMSelect, (prevProps, nextProps) => {
    if (prevProps.onSelect !== nextProps.onSelect) return false;
    if (prevProps.selectedKey !== nextProps.selectedKey) return false;

    return true;
});

export default LLMSelect;