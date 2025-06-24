"use client";

import { LLM } from "@/lib/ai/types";
import { getLLMGroupedByProvider } from "@/lib/ai/utils";
import { API_ROUTES } from "@/lib/apiRoutes";
import { memo, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "../ui/badge";
import { cn, fetcher } from "@/lib/utils";
import useLLMCookie from "@/hooks/useLLMCookie";
import LLMIcon from "../llm/llm-icon";
import { TIMINGS_MILLISECONDS } from "@/lib/timings";
import Spinner from "../ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const PureLLMCard = ({ llm, selected, onClick }: { llm: LLM; selected: boolean; onClick: (llm: LLM) => void }) => {
    return (
        <Card
            onClick={() => onClick(llm)}
            className={cn("flex flex-col gap-2 py-3 bg-transparent transition-all border", { "border-green-400 bg-green-800/30 shadow-lg shadow-green-400/20": selected })} 
        >
            <CardHeader>
                <CardTitle>{llm.name}</CardTitle>
                <CardDescription className="text-xs dark:text-neutral-400">{llm.usecase}</CardDescription>
            </CardHeader>
            {llm.tags && llm.tags.length > 0 && (
                <CardContent className="flex flex-wrap gap-2">
                    {llm.tags.map(tag => (
                        <Badge 
                            variant={"outline"} 
                            className={cn("bg-transparent text-xs text-muted-foreground", {
                                "text-emerald-400": tag === "Free",
                            })}
                            key={tag}
                        >
                            {tag}
                        </Badge>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}

const LLMCard = memo(PureLLMCard, (prevProps, nextProps) => {
    if (prevProps.llm.key !== nextProps.llm.key) return false;
    if (prevProps.selected !== nextProps.selected) return false;
    if (prevProps.onClick !== nextProps.onClick) return false;

    return true;
});

type LLMOverviewProps = {
    nextStep: () => void;
    defaultLLM?: LLM | undefined;
}

const PureLLMOverview = ({nextStep, defaultLLM} : LLMOverviewProps) => {
    const { llmCookie } = useLLMCookie(defaultLLM);
    const [selectedLLM, setSelectedLLM] = useState<LLM | null>(defaultLLM || null);

    const { data: profile, isLoading, isValidating } = useSWR(API_ROUTES.GET_OWN_PROFILE, fetcher, {
        dedupingInterval: TIMINGS_MILLISECONDS.ONE_MINUTE, // 1 minute
    });

    const handleLLMSelected = async (llm: LLM) => {
        setSelectedLLM(llm);

        // fetch instead
        // setLLMModelCookie(llm.key);

        fetch(API_ROUTES.LLM_COOKIE, {
            body: JSON.stringify({ model: llm.key }),
            method: "POST",
        }).then(res => {
            if (!res.ok) { throw new Error("Failed to set LLM model cookie");  }
        }).catch(err => {
            console.error("Error setting LLM model cookie:", err);
        })
        
    }

    /**
     * If the LLM cookie is set and the selectedLLM is not set, then set the selectedLLM to the LLM from the cookie
     * This is useful when the user has already selected an LLM in a previous session
     */
    useEffect(() => {
        if(llmCookie && !selectedLLM) {;
            if(llmCookie) {
                setSelectedLLM(llmCookie);
                //nextStep();
            }
        }
    }, [llmCookie, setSelectedLLM, selectedLLM, nextStep])

    const groups = useMemo(() => {
        return getLLMGroupedByProvider(profile);
    }, [profile]);    
    
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3>1. Select a Model</h3>
                    {selectedLLM && <span className="text-xs text-emerald-400">✅ {selectedLLM.name}</span>}
                </div>
                

                {(isLoading || isValidating) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Spinner />
                        <span>Updating List</span>
                    </div>
                )}
            </div>
        
            <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[400px]">
                <Accordion type="single" collapsible>
                    {groups.map(group => (
                        <AccordionItem value={group.provider} key={group.provider} className="flex flex-col gap-2">
                            <AccordionTrigger>
                                <div className="flex flex-row items-center justify-start gap-4">
                                    <LLMIcon provider={group.provider} width={16} />
                                    <h3 className="text-lg font-semibold">{group.provider}</h3>
                                    <span className="text-xs text-muted-foreground">({group.llms.length} LLM{group.llms.length > 1 ? "s" : ""})</span>
                                </div>
                            </AccordionTrigger>
                            
                            <AccordionContent className="flex flex-col gap-2">
                                {group.llms.map(llm => (
                                    <LLMCard
                                        key={llm.key}
                                        llm={llm}
                                        selected={selectedLLM?.key === llm.key}
                                        onClick={handleLLMSelected}
                                    />
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    )
}

const LLMOverview = memo(PureLLMOverview, (prevProps, nextProps) => {
    if (prevProps.nextStep !== nextProps.nextStep) return false;
    if (prevProps.defaultLLM !== nextProps.defaultLLM) return false;

    return true;
})

export default LLMOverview;