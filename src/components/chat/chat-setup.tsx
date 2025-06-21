"use client";

import { LLM } from "@/lib/ai/types";
import { getLLMById, getLLMGroupedByProvider } from "@/lib/ai/utils";
import { API_ROUTES } from "@/lib/apiRoutes";
import { Persona } from "@/types/db";
import { memo, useEffect, useState } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "../ui/badge";
import { cn, fetcher, truncateText } from "@/lib/utils";
import { Button } from "../ui/button";
import useLLMCookie from "@/hooks/useLLMCookie";
import Image from "next/image";
import { ChatRequestOptions, Message } from "ai";
import LLMIcon from "../llm/llm-icon";

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

const LLMOverview = ({nextStep} : { nextStep: () => void }) => {
    const { llmCookie } = useLLMCookie();
    const [selectedLLM, setSelectedLLM] = useState<LLM | null>(null);

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
        if(llmCookie && !selectedLLM) {
            const llm = getLLMById(llmCookie.llm);
            if(llm) {
                setSelectedLLM(llm);
                nextStep();
            }
        }
    }, [llmCookie, setSelectedLLM, selectedLLM, nextStep])

    return (
        <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[400px]">
            {/* {LLMsWithAPIKeys(profile).map(llm => (
                <LLMCard
                    key={llm.key}
                    llm={llm}
                    selected={selectedLLM?.key === llm.key}
                    onClick={handleLLMSelected}
                />
            ))} */}
            
            {getLLMGroupedByProvider().map(group => (
                <div key={group.provider} className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <LLMIcon provider={group.provider} width={16} />
                        <h3 className="text-lg font-semibold">{group.provider}</h3>  
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        {group.llms.map(llm => (
                            <LLMCard
                                key={llm.key}
                                llm={llm}
                                selected={selectedLLM?.key === llm.key}
                                onClick={handleLLMSelected}
                            />
                        ))}
                    </div>
                </div>
            ))}

        </div>
    )
}

LLMOverview.displayName = "LLMOverview";

type Props = {
    chatId?: string;
    characterId?: string;
    setDone: React.Dispatch<React.SetStateAction<boolean>>;
    append: (message: Message, options?: ChatRequestOptions) => void;
}

const maxSteps = 2;

const PureChatSetup = (props: Props) => {
    
    const { data: personas } = useSWR<Persona[]>(API_ROUTES.GET_PERSONAS, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
    })

    
    const [selectedPersona, setSelectedPersona] = useState<Persona| null>(null);

    const [step, setStep] = useState(1);

    const handleNextStep = () => {
        if (step === maxSteps)  {
            props.setDone(true);
        } else {
            setStep(prev => prev + 1);
        }
    }

    return (
        <div className="flex flex-col justify-center p-4 size-full gap-4">
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold">Chat Setup</h2>
                <p className="text-xs dark:text-neutral-400">You can change your settings here or just start typing below.</p>
            </div>

            {step === 1 && (
                <div className="w-full flex flex-col gap-4">
                    <h3>1. Select LLM</h3>
                    <LLMOverview nextStep={handleNextStep} />
                </div>
            )}


            {step === 2 && (
                <div>
                    <h3>2. Select a Persona</h3>
                    <div className="flex flex-col gap-2 w-full overflow-y-auto max-h-[400px]">
                        {(personas?.length === 0 || !personas) && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-neutral-500">No personas available. You can create one in your profile settings or start chatting without one.</p>
                            </div>
                        )}
                        {personas?.map(persona => (
                            <Card key={persona.id} className={cn("flex flex-row gap-2 p-3 transition-all border", { "border-green-400 bg-green-800/30 shadow-lg shadow-green-400/20": selectedPersona?.id === persona.id })} onClick={() => setSelectedPersona(persona)}>
                                {persona.avatar_link && (
                                    <div className="relative size-16 rounded-xl overflow-hidden shrink-0">
                                        <Image fill src={persona.avatar_link} alt={persona.full_name} className="object-cover" />
                                    </div>
                                )}
                                
                                <CardHeader className="flex flex-col w-full flex-1 p-0 overflow-hidden">
                                    <CardTitle className="truncate">{persona.full_name}</CardTitle>
                                    <CardDescription className="text-xs dark:text-neutral-400/80">{truncateText(persona.bio, 117)}</CardDescription>
                                </CardHeader>

                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-row items-center justify-center gap-2 w-full overflow-hidden">
                <Button onClick={() => setStep(prev => prev-1)} disabled={step === 1} variant="ghost">
                    Back
                </Button>
                <Button onClick={handleNextStep} className=" grow w-fit ">
                    {step === maxSteps ? "Start Chat" : "Next Step"}
                </Button>
            </div>

        </div>
    )
}


export const ChatSetup = memo(PureChatSetup, (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.characterId !== nextProps.characterId) return false;
    if (prevProps.setDone !== nextProps.setDone) return false;
    if (prevProps.append !== nextProps.append) return false;
    
    return true;
})