"use client";

import { Character, Profile } from "@/types/db";
import dynamic from "next/dynamic";
const AnimeImport = dynamic(() => import("./importers/AnimeImport"), { ssr: false });
const AICharacterCardsImporter = dynamic(() => import("./importers/AICharacterCardImporter"), { ssr: false });
const FandomImporter = dynamic(() => import("./importers/FandomImporter"), { ssr: false });
const WikipediaImport = dynamic(() => import("./importers/WikipediaImport"), { ssr: false });
const JanitorImporter = dynamic(() => import("./importers/JanitorImporter"), { ssr: false });

type Props = {
    character: Character;
    setCharacter: (character: Character) => void;
    profile: Profile;
}

export default function CharacterNewImport(props: Props) {


    return (
        <>
        <div className="flex flex-col gap-2 w-full">
            <h1 className="text-xl font-bold">Import</h1>
            
            <Tabs className="w-full">
                <Tab title="Anime" className="w-full">
                    <AnimeImport 
                        setCharacter={props.setCharacter}
                        profile={props.profile}
                    />  
                </Tab>
                <Tab title="Silly Tavern">
                    <AICharacterCardsImporter
                        setCharacter={props.setCharacter}
                        profile={props.profile}
                    />
                </Tab>
                <Tab title="JanitorAI">
                    <JanitorImporter
                        setCharacter={props.setCharacter}
                        profile={props.profile}
                    />
                </Tab>

                <Tab title="Fandom">
                    <FandomImporter
                        setCharacter={props.setCharacter}
                        profile={props.profile}
                    />
                </Tab>
                <Tab title="Wikipedia">
                    <WikipediaImport 
                        setCharacter={props.setCharacter}
                        profile={props.profile}
                    />
                </Tab>
            </Tabs>
        </div>
        
        </>
    )
}