"use server";


import { Profile, Story } from "@/types/db";
import Icon from "@/components/utils/Icon";

import { Character } from "@/types/db";
import CategoryCard from "./CategoryCard";
import Markdown from "react-markdown";
import { safeParseLink } from "@/lib/utils";
import { Card, CardBody } from "@nextui-org/card";
import Username from "../user/Username";
import ImageWithBlur from "../ImageWithBlur";
import Image from "next/image";
import CharacterPageActions from "./CharacterePageActions";
import CharacterPageTabs from "./CharacterPageTabs";

type Props = {
    character: Character,
    stories: Story[],
    profile?: Profile
}

export default async function CharacterPage(props: Props) {

    const transformedCharacter: Character = props.character;

    if(props.character.hide_definition) {
        transformedCharacter.bio = "";
        transformedCharacter.book = "";
        transformedCharacter.intro = "";
        transformedCharacter.first_message = "";
        transformedCharacter.scenario = "";
        transformedCharacter.personality = "";
        transformedCharacter.system_prompt = "";
        transformedCharacter.image_prompt = "";
    }

    return (
        <>
        <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden">

            <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-75 overflow-hidden">
                <Image src={safeParseLink(props.character.image_link)} layout="fill" className="object-cover" alt="" />
            </div>

            <div className="flex flex-row max-lg:flex-col gap-6 items-start max-lg:items-center justify-center w-full">

                <div className="flex flex-col justify-center gap-4 max-lg:w-full">
                    <div className="flex flex-col gap-2 items-center justify-center">
                        <ImageWithBlur 
                            src={props.character.image_link} 
                            className="w-32 h-32" 
                            alt={props.character.name} 
                            sizes="128px" 
                            width={128}
                            height={128}
                            radius="rounded-full"
                            is_nsfw={props.character.is_nsfw}
                        />
                        <h1 className="text-xl font-bold">{props.character.name}</h1>
                        <Username profile={props.character.owner} hasLink textSize="sm" />
                    </div>

                    <div className="w-full flex items-center justify-center gap-2">
                        <CharacterPageActions 
                            character={props.character}
                            profile={props.profile}
                        />
                    </div>

                    {props.character.is_private && 
                        <div className="flex flex-col gap-1 border border-green-500 rounded-lg p-2">
                            <div className="flex items-center gap-1 text-green-500">
                                <Icon downscale filled color="green-500">lock</Icon>
                                <span className="text-sm">Private</span>
                            </div>
                            <span className="text-xs dark:text-zinc-400">This Character is only accessible by you and otherwise encrypted.</span>
                        </div>
                    }

                    <div className="flex flex-row flex-wrap gap-2 text-sm dark:text-zinc-200">
                        
                        <div className="flex items-center gap-2">
                            <Icon downscale filled>chat_bubble</Icon>
                            <span>{props.character.chats} Chats</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Icon downscale filled>favorite</Icon>
                            <span>{props.character.likes} Likes</span>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert prose-p:text-sm dark:prose-p:text-neutral-400 !select-none">
                        <Markdown>{props.character.description}</Markdown>
                    </div>
                    
                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <CategoryCard data={props.character.category} />
                        {props.character.speaker_link &&
                            <Card 
                                className={`
                                    w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full bg-zinc-200/70 dark:bg-zinc-600/40
                                    backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                                `}
                                >
                                <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                                    Has customized Voice
                                </CardBody>
                            </Card>
                        }
                        {props.character.tags_full?.map(tag => (
                        <Card 
                            key={tag.id}
                            className={`
                                w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full bg-zinc-200/70 dark:bg-zinc-600/40
                                backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                            `}
                        >
                            <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                                {tag.name}
                            </CardBody>
                        </Card>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col w-full max-w-xl max-lg:max-w-full">
                 <CharacterPageTabs 
                    character={transformedCharacter}
                    stories={props.stories}
                    profile={props.profile}
                />
                </div>
            </div>
                        


        </div>
        </>
    )

}