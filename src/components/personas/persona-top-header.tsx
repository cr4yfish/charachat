"use client";

import { cn } from "@/lib/utils";
import { Persona } from "@/lib/db/types/persona";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronLeftIcon, DramaIcon, EditIcon } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import { memo, useEffect, useState } from "react";
import Spinner from "../ui/spinner";
import { setPersonaDefault } from "@/app/p/actions";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";


function PurePersonaTopHeader({ persona, isOwner, isDefault } : { persona: Persona, isOwner?: boolean, isDefault?: boolean }) {
    const { isMobile } = useSidebar();
    const [isSettingDefault, setIsSettingDefault] = useState(false);
    const [internalIsDefault, setInternalIsDefault] = useState(isDefault || false);
    const { mutateProfile, profile, isLoading: isLoadingProfile } = useProfile();
    const router = useRouter();

    // Improve accuracy of default persona state
    // Passed by props is not always accurate, 
    // as its from cookies and maybe stale
    useEffect(() => {
        if(profile?.settings?.default_persona_id === persona.id) {
            setInternalIsDefault(true);
        }
    }, [profile, persona.id])

    const handleSetDefault = () => {
        setIsSettingDefault(true);
        setInternalIsDefault(prev => !prev);
        setPersonaDefault(persona.id, internalIsDefault)
        .then(() => {
            mutateProfile((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    settings: {
                        ...prev.settings,
                        default_persona_id: internalIsDefault ? undefined : persona.id,
                    }
                };
            });
        })
        .finally(() => {
            setIsSettingDefault(false);
        });
    }

    return (
        <div className={cn("fixed top-0 left-0 w-full h-[75px] bg-gradient-to-b from-black/50 to-transparent z-50", { "ml-[260px] pr-[280px]": !isMobile })}>
            <div className="relative size-full px-4 py-2 ios-safe-header-padding  flex items-center justify-between overflow-hidden">
                <div className="flex flex-row items-center gap-2">
                    <Link href={"/"}  onClick={(e) => {
                        e.preventDefault();
                        router.back();
                    }} >
                        <ChevronLeftIcon />
                    </Link>
                    <span className="text-3xl font-bold font-leckerli">
                        Persona
                    </span> 
                </div>
                <div className="flex flex-row gap-2 items-center justify-center">
                    {isOwner && 
                    <Link href={"/p/" + persona.id + "/edit"}>
                        <Button>
                            <EditIcon />
                            <span>Edit Persona</span> 
                        </Button>
                    </Link>
                    }
                    <Button onClick={handleSetDefault} disabled={isSettingDefault || isLoadingProfile} className={cn("w-fit", { "bg-emerald-400/50": internalIsDefault })} >
                        {(isSettingDefault || isLoadingProfile) ? <Spinner /> : <DramaIcon />}
                        <span>
                        {internalIsDefault ? "Default Persona" : "Set as Default"}    
                        </span> 
                    </Button>
                </div>
                <div className="absolute top-0 left-0 -z-10 size-full backdrop-blur-[1px] pointer-events-none " ></div>
            </div>
        </div>
    );
}

const PersonaTopHeader = memo(PurePersonaTopHeader, (prevProps, nextProps) => {
    return prevProps.persona.id === nextProps.persona.id && prevProps.isOwner === nextProps.isOwner && prevProps.isDefault === nextProps.isDefault;
});

export default PersonaTopHeader;