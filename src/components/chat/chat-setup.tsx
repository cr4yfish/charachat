"use client";

import { LLM } from "@/lib/ai/types";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { Persona } from "@/lib/db/types/persona";
import { memo,  useEffect,  useMemo,  useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn, fetcher } from "@/lib/utils";
import { safeParseLink, truncateText } from "@/lib/utils/text";
import { Button } from "../ui/button";
import Image from "next/image";
import { ChatRequestOptions, Message } from "ai";
import LLMOverview from "./chat-llm-overview";
import Spinner from "../ui/spinner";
import { ChevronRightIcon } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { LIMITS } from "@/lib/constants/limits";

type Props = {
    chatId?: string;
    characterId?: string;
    setDone: React.Dispatch<React.SetStateAction<boolean>>;
    append: (message: Message, options?: ChatRequestOptions) => void;
    defaultLLM?: LLM | undefined;
}

const maxSteps = 2;

const PureChatSetup = (props: Props) => {
    const [hasMore, setHasMore] = useState(true);
    const { data, isLoading: personasLoading, isValidating: personasValidating, setSize } = useSWRInfinite<Persona[]>(
        (index, prevPageData) => {
            // If it's not the first page and the previous page was empty, stop loading
            if (index > 0 && prevPageData && prevPageData.length === 0) return null;
            
            // If we've determined there are no more pages, stop loading (but allow first page)
            if (!hasMore && index > 0) return null;
            
            const cursor = index * LIMITS.MAX_PERSONAS_PER_PAGE;
            return API_ROUTES.GET_PERSONAS + `?limit=${LIMITS.MAX_PERSONAS_PER_PAGE}&cursor=${cursor}`;
        }, 
        fetcher
    );


    const personas = useMemo(() => {
        return data ? data.flat() : [];
    }, [data]);
    const [selectedPersona, setSelectedPersona] = useState<Persona| null>(null);

    const [step, setStep] = useState(1);

    useEffect(() => {
        if (data && data.length > 0) {
            const lastPage = data[data.length - 1];
            setHasMore(lastPage.length === LIMITS.MAX_PERSONAS_PER_PAGE);
        }
    }, [data]);

    const handleNextStep = () => {
        if (step === maxSteps)  {
            props.setDone(true);
        } else {
            setStep(prev => prev + 1);
        }
    }

    const handleSetPersona = (persona: Persona) => {
        setSelectedPersona(persona);
        fetch(API_ROUTES.PERSONA_COOKIE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ personaId: persona.id }),
        }).catch(err => {
            console.error("Error setting persona cookie:", err);
        });
    }

    const handleLoadMorePersonas = () => {
        setSize(prevSize => prevSize + 1);
    }

    return (
        <div id="chat-setup" className="flex flex-col justify-start p-4 size-full gap-2 pt-[75px] max-h-full overflow-hidden max-w-[960px] mx-auto">

            {step === 1 && (
                <LLMOverview defaultLLM={props.defaultLLM} nextStep={handleNextStep} />
            )}            
            {step === 2 && (
                <div className="size-full relative flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">

                        <div className="flex flex-col gap-1 text-sm font-bold">
                            {selectedPersona ?
                                <h3 className="text-emerald-400">✅ {selectedPersona.full_name}</h3>
                             : 
                                <h3>Select a Persona (optional)</h3>}
                        </div>
                        

                        {(personasLoading || personasValidating) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Spinner />
                                <span>Updating List</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 w-full overflow-y-auto h-full max-h-full pb-[100px]">                        
                        {(personasLoading || personasValidating) && (
                            <div className="flex items-center justify-center h-32">
                                <Spinner size="large" />
                            </div>
                        )}
                        
                        {!personasLoading && !personasValidating && (personas?.length === 0 || !personas) && (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-muted-foreground">No personas available. You can create one in your profile settings or start chatting without one.</p>
                            </div>
                        )}
                        
                        {personas?.map(persona => (
                            <Card 
                                key={persona.id} 
                                className={cn("flex flex-row gap-2 p-3 transition-all border cursor-pointer hover:bg-accent/50", { "border-green-400 bg-green-800/30 shadow-lg shadow-green-400/20": selectedPersona?.id === persona.id })} 
                                onClick={() => handleSetPersona(persona)}>
                                {persona.avatar_link && (
                                    <div className="relative size-16 rounded-xl overflow-hidden shrink-0">
                                        <Image fill src={safeParseLink(persona.avatar_link)} alt={persona.full_name} className="object-cover" />
                                    </div>
                                )}
                                
                                <CardHeader className="flex flex-col w-full flex-1 p-0 overflow-hidden">
                                    <CardTitle className="truncate">{persona.full_name}</CardTitle>
                                    <CardDescription className="text-xs dark:text-neutral-400/80">{truncateText(persona.bio, 117)}</CardDescription>
                                </CardHeader>

                            </Card>
                        ))}

                        {hasMore && <Button onClick={handleLoadMorePersonas} variant={"secondary"}>Load more</Button>}
                          {personasValidating && !personasLoading && (
                            <div className="flex items-center justify-center py-2">
                                <Spinner size="small" />
                                <span className="ml-2 text-xs text-neutral-500">Refreshing...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}            
            <div className="flex flex-row items-center justify-center gap-2 w-full overflow-hidden self-end shrink-0 max-w-[400px] px-4 mx-auto z-50 absolute bottom-[50px] left-0">
                <Button onClick={() => setStep(prev => prev-1)} disabled={step === 1} variant="ghost">
                    Back
                </Button>
                <Button 
                    onClick={handleNextStep} 
                    variant={"secondary"}
                    className="grow w-fit flex justify-between items-center"
                    disabled={step === 2 && personasLoading}
                >
                    {step === maxSteps ? "Start Chat" : "Choose Persona"}
                    {step === maxSteps ? null : <ChevronRightIcon size={16} />}
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