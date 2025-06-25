

const CharacterBubbles = dynamic(() => import('@/components/new-character/character-bubbles'));
import NewPersonaDrawer from "@/components/personas/new-persona-drawer";
import { COOKIE_NAMES } from "@/lib/constants/cookieNames";
import { Persona } from "@/lib/db/types/persona";
import { ChevronRightIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default async function NewPersonaPage({ searchParams }: { searchParams: Promise<{ isImport?: string | undefined }>}) {
    const { isImport="false" } = await searchParams;
    const cookieStore = await cookies();

    const draftPersonaCookie = cookieStore.get(COOKIE_NAMES.DRAFT_PERSONA)?.value;
    let newPersona: Persona | undefined;

    if(draftPersonaCookie) {
        try {
            newPersona = JSON.parse(draftPersonaCookie) as Persona;
        } catch (e) {
            console.error("Failed to parse persona cookie:", e);
        }
    }

    if((newPersona && newPersona.id.length === 0) || !newPersona) {
        newPersona = {
            id: uuidv4(),
        } as Persona; // Initialize a new persona if cookie is empty or invalid
    }
    
    return (
        <>
        <div className="px-4 flex flex-col size-full pt-[75px] pb-[100px] items-center justify-center overflow-hidden relative z-10">
        
            {/* Char bubbles */}
            <div className="absolute top-0 left-0 size-full flex items-center justify-center z-0 overflow-visible opacity-50">
              <CharacterBubbles variant="persona" />  
            </div>
            
            {/* CTA -> opens drawer */}
            <div className="max-w-lg z-50">
                <NewPersonaDrawer initPersona={newPersona} defaultOpen={isImport === "true"} />
            </div>

            {/* Link to importers */}
            <div className="w-full flex items-center justify-center mt-8 pb-4 z-20">
                <Link href={"/c/new/import"} className=" text-muted-foreground flex items-center gap-1" >
                    Import instead
                    <ChevronRightIcon size={14} />
                </Link>
            </div>        
        </div>

        {/* Background gradient */}
        <div className="absolute bottom-0 left-0 size-full backdrop-blur-[1px] z-[1] overflow-hidden">
            <div className="size-full bg-gradient-to-tr from-emerald-800/20 to-emerald-800/50 animate-[gradient_8s_ease-in-out_infinite] opacity-80"></div>
            <div className="absolute inset-0 size-full bg-gradient-to-bl from-emerald-800/10 to-transparent animate-[gradient_12s_ease-in-out_infinite_reverse] opacity-60"></div>
        </div>

        {/* Background image */}
        <div className="absolute bottom-0 left-0 size-full z-0 opacity-15 ">
            <Image 
                alt="" fill
                className="object-cover"
                src={"/images/forest2.webp"}
            />
        </div>
        </>
    )
}