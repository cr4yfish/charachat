"use client";

import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { Persona } from "@/lib/db/types/persona";
import { memo,  useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChatRequestOptions, Message } from "ai";
import { ChevronRightIcon } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import PersonaSmallCard, { PersonaSmallCardSkeleton } from "../personas/persona-small-card";
import { Accordion } from "../ui/accordion";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { setPersonaCookie } from "@/app/actions";
const PersonaSelector = dynamic(() => import("../personas/persona-selector"), { ssr: false });

type Props = {
    chatId?: string;
    characterId?: string;
    setDone: React.Dispatch<React.SetStateAction<boolean>>;
    append: (message: Message, options?: ChatRequestOptions) => void;
}

const PureChatSetup = (props: Props) => {
    const { profile, isLoading } = useProfile(); // I expect this to be cached at this point and not take long to load in real use
    const [selectedPersona, setSelectedPersona] = useState<Persona| null>(null);
    const { data: defaultPersona } = useSWR<Persona>(
        profile?.settings?.default_persona_id ? API_ROUTES.GET_PERSONA + profile.settings.default_persona_id : null, 
        fetcher
    )

    useEffect(() => {
        if (defaultPersona) {
            setSelectedPersona(defaultPersona);
        }
    }, [defaultPersona]);

    const handleSetPersona = (persona: Persona) => {
        setSelectedPersona(persona);
        setPersonaCookie(persona.id)
    }

    const handleDone = () => {
        props.setDone(true);
    }

    return (
        <div id="chat-setup" className="flex flex-col justify-start p-4 size-full gap-2 ios-safe-header-padding-chat max-h-full overflow-hidden max-w-[960px] mx-auto">
         
            <div className="flex flex-col prose dark:prose-invert prose-h2:m-0 prose-h2:mb-1">
                <h2>Select a Persona (optional)</h2>
            </div>
            <Accordion type="single" className="w-full" defaultValue="persona" collapsible>
                <AccordionItem value="persona" className="w-full">
                    <AccordionTrigger>
                        <div className="w-full flex flex-row items-center justify-between gap-2">
                            {selectedPersona && 
                                <PersonaSmallCard 
                                    data={selectedPersona}
                                    hasLink={false}
                                />
                            }
                            {isLoading && <PersonaSmallCardSkeleton /> }
                            {!selectedPersona && !isLoading && (
                                <div className="text-muted-foreground text-sm">
                                    {"Select a Persona to start chatting"}
                                </div>
                            )}
                        </div>

                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                        <PersonaSelector onClick={handleSetPersona} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        
                   
            <div className="flex flex-row items-center justify-end gap-2 w-full overflow-hidden self-end shrink-0 max-w-[400px] px-4 mx-auto z-50 left-0">
                <Button 
                    onClick={handleDone} 
                    variant={"secondary"}
                    className="grow w-fit flex justify-between items-center"
                >
                    {"Start Chat"}
                    <ChevronRightIcon size={16} />
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