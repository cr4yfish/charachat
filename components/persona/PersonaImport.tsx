"use client";

import { Persona, Profile } from "@/types/db";
import {Tabs, Tab} from "@nextui-org/tabs";

import AnimeImport from "../character/AnimeImport";

type Props = {
    persona: Persona;
    setPersona: (persona: Persona) => void;
    profile: Profile;
}

export default function PersonaImport(props: Props) {


    return (
        <>
        <div className="flex flex-col gap-2 w-full">
            <h1 className="text-xl font-bold">Import</h1>
            
            <Tabs className="w-full">
                <Tab title="Anime & Manga" className="w-full">
                    <AnimeImport 
                        setPersona={props.setPersona}
                        profile={props.profile}
                    />  
                </Tab>
            </Tabs>
        </div>
        
        </>
    )
}