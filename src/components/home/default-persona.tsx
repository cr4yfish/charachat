"use client";

import { useProfile } from "@/hooks/use-profile";
import PersonaImageCard from "../personas/persona-image-card";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/constants/apiRoutes";
import { Persona } from "@/lib/db/types/persona";
import Spinner from "../ui/spinner";
import { fetcher } from "@/lib/utils";


export default function DefaultPersona() {
    const { profile } = useProfile();

    const { data: defaultPersona, isLoading } = useSWR<Persona>(profile?.settings?.default_persona_id ?
        API_ROUTES.GET_PERSONA + profile.settings.default_persona_id :
        null, fetcher
    )

    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Default Persona</h2>
            <div className="flex flex-col">
                {isLoading && <Spinner />}
                {defaultPersona &&
                    <PersonaImageCard 
                        data={defaultPersona}
                        hasLink={true}
                    />
                }
                {!defaultPersona && !isLoading &&
                    <div className="text-muted-foreground">
                        No default persona set. You can set one on Persona pages.
                    </div>
                }
            </div>
        </div>
    )
}