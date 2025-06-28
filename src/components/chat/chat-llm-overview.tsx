"use client";

import { LLM, TextModelId } from "@/lib/ai/models/llm";
import { getLLMById, getLLMGroupedByProvider } from "@/lib/ai/utils";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import LLMIcon from "../llm/llm-icon";
import Spinner from "../ui/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProfile } from "@/hooks/use-profile";
import { truncateNumber } from "@/lib/utils/text";

const PureLLMCard = ({ llm, selected, onClick, simpleMode, showIcon }: { llm: LLM; selected: boolean; onClick: (llm: LLM) => void, simpleMode: boolean, showIcon?: boolean }) => {
    return (
        <Card
            onClick={() => onClick(llm)}
            className={cn("flex flex-col gap-2 py-3 bg-transparent transition-all border", { "border-green-400 bg-green-800/30 shadow-lg shadow-green-400/20": selected })} 
        >
            <CardHeader>
                <CardTitle className="flex flex-row items-center gap-2 max-sm:text-xs">
                    {showIcon && <LLMIcon provider={llm.provider} /> }
                    {simpleMode ? llm.alias : llm.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground sm:hidden">{llm.usecase}</CardDescription>
            </CardHeader>
            {llm.tags && llm.tags.length > 0 && (
                <CardContent className="flex flex-wrap gap-2">
                    {llm.isFree && (
                        <Badge variant="outline" className="bg-transparent text-xs text-emerald-400">
                            Free
                        </Badge>
                    )}
                    {llm.contextLength &&
                        <Badge variant="outline" className="bg-transparent text-xs text-sky-400">
                            {truncateNumber(llm.contextLength)} Context
                        </Badge>
                    }
                    {/* {llm.tags.map(tag => (
                        <Badge 
                            variant={"outline"} 
                            className={cn("bg-transparent text-xs text-muted-foreground")}
                            key={tag}
                        >
                            {tag}
                        </Badge>
                    ))} */}
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


const PureLLMOverview = () => {
    const [selectedLLM, setSelectedLLM] = useState<LLM | undefined>(undefined);
    
    /**
     * Switches how the LLMs are displayed.
     * Simple only shows a small selection of recommended LLMs and different use cases instead of the actual names.
     */
    const [mode, setMode] = useState<"simple" | "advanced">("simple");
    const { profile, isLoading, isValidating, mutateProfile } = useProfile();

    useEffect(() => {
        if(profile?.settings?.default_llm) {
            setSelectedLLM(getLLMById(profile.settings.default_llm as TextModelId));
        }
    }, [profile])

    const handleLLMSelected = async (llm: LLM) => {
        setSelectedLLM(llm);
        mutateProfile(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    default_llm: llm.key
                }
            };
        });
    }

    const groups = useMemo(() => {
        return getLLMGroupedByProvider(profile);
    }, [profile]);    
    
    return (
        <div id="llm-overview" className="w-full flex flex-col gap-4 h-full overflow-hidden">
            <div className="flex items-center justify-between gap-2">

                <div className="flex flex-row items-center justify-between gap-1 text-sm font-black">
                    
                    {selectedLLM ? 
                        <h3 className=" text-emerald-400">✅ {selectedLLM.name}</h3> 
                    :
                        <h3>Select a Model</h3>
                    }
                </div>
                

                {(isLoading || isValidating) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Spinner />
                        <span>Updating List</span>
                    </div>
                )}
            </div>
        
            <div className="flex flex-col gap-2 w-full overflow-y-auto h-full">
                <Tabs defaultValue="simple" value={mode} onValueChange={(val) => setMode(val as "simple" | "advanced")} className="w-full">
                    <TabsList>
                        <TabsTrigger value="simple">Simple</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="simple">
                        <div className="flex flex-col gap-2">
                            {groups.map(group => (
                                group.llms.filter(llm => llm.recommended).map(llm => (
                                    <LLMCard
                                        key={llm.key}
                                        llm={llm}
                                        selected={selectedLLM?.key === llm.key}
                                        onClick={handleLLMSelected}
                                        simpleMode={mode === "simple"}
                                        showIcon
                                    />
                                ))
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="advanced">
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
                                                simpleMode={mode === "simple"}
                                            />
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>                        
                    </TabsContent>
                </Tabs>


            </div>
        </div>
    )
}

const LLMOverview = memo(PureLLMOverview, () => {
    return true;
})

export default LLMOverview;