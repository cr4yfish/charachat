"use client";

import { Character, Profile } from "@/types/db";
import {Tabs, Tab} from "@nextui-org/tabs";
import AnimeImport from "./importers/AnimeImport";
import AICharacterCardsImporter from "./importers/AICharacterCardImporter";
import FandomImporter from "./importers/FandomImporter";
import WikipediaImport from "./importers/WikipediaImport";
import JanitorImporter from "./importers/JanitorImporter";


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