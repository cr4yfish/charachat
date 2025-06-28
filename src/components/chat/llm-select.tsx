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
import { LLM, TextModelId } from "@/lib/ai/models/llm";
import { getLLMById, getLLMGroupedByProvider } from "@/lib/ai/utils";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { _DEFAULT_LLM } from "@/lib/constants/defaults";
import LLMIcon from "../llm/llm-icon";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useProfile } from "@/hooks/use-profile";

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
                        className={cn("text-xs text-muted-foreground")}
                    >
                        {tag}
                    </Badge>
                ))}
                {llm.isFree && (
                    <Badge variant="outline" className="text-xs text-emerald-400">
                        Free
                    </Badge>
                )}
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
    onSelect?: (key: TextModelId) => void;
    selectedKey?: TextModelId | undefined;
    disabled?: boolean;
    label?: string;
    description?: string;
    showLink?: boolean;
    isLoading?: boolean;
}

const PureLLMSelect = (props: Props) => {
    const { profile } = useProfile();

    const llmGroups = useMemo(() => {
        return getLLMGroupedByProvider(profile);
    }, [profile])

    return (
        <div className="flex flex-col gap-2">
            <Label className="flex flex-col items-start gap-1" htmlFor="llm-select">
                <div className="w-full flex flex-row items-center justify-between gap-2">
                   <span>{props.label || "Select a Model"}</span> 
                    {props.showLink && 
                    <Link className="text-xs font-light text-blue-400 flex items-center gap-1" href={"/home/settings"}>
                        <LinkIcon size={10} />
                        Manage API Keys
                    </Link>
                    }
                </div>
                
                <span className="text-xs text-muted-foreground">{props.description}</span>

            </Label>
            <Select disabled={props.disabled} name="llm-select" value={props.selectedKey} onValueChange={(val) => props.onSelect?.(val as TextModelId)}  >

                <SelectTrigger size={"removesizingcss"} className="h-fit rounded-2xl w-full border-border">
                    <SelectValue aria-label="Select a LLM" className="!h-fit !border-border">


                       {!props.isLoading && <FancyLLM llm={getLLMById(props.selectedKey || _DEFAULT_LLM)} showIcon showProvider  />}

                        {(props.isLoading || !props.selectedKey) && (
                            <div className="flex flex-col justify-start gap-1 w-full h-[63px]">
                                <Skeleton className="w-[70px] h-[16px] bg-muted/50 pb-0.5" />
                                <Skeleton className="w-[140px] h-[20px] bg-muted/50" />
                                <div className="flex flex-row flex-wrap gap-1">
                                    <Skeleton className="w-[50px] h-[16px] bg-muted/50" />
                                    <Skeleton className="w-[50px] h-[16px] bg-muted/50" />
                                </div>
                            </div>
                        )}

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
                                    value={llm.key}
                                    role="button"
                                    onClick={() => props.onSelect?.(llm.key)}
                                    className="dark:hover:bg-primary/10"
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
    if (prevProps.disabled !== nextProps.disabled) return false;
    if (prevProps.label !== nextProps.label) return false;
    if (prevProps.description !== nextProps.description) return false;
    if (prevProps.showLink !== nextProps.showLink) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
});

export default LLMSelect;