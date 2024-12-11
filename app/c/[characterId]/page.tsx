"use server";

import { getCharacter } from "@/functions/db/character";
import { Character } from "@/types/db";
import { getCharacterStories } from "@/functions/db/stories";
import Icon from "@/components/utils/Icon";
import CategoryCard from "@/components/character/CategoryCard";
import Markdown from "react-markdown";
import { safeParseLink } from "@/lib/utils";
import { Card, CardBody } from "@nextui-org/card";
import Username from "@/components/user/Username";
import ImageWithBlur from "@/components/ImageWithBlur";
import Image from "next/image";
import CharacterPageActions from "@/components/character/CharacterePageActions";
import CharacterPageTabs from "@/components/character/CharacterPageTabs";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type Params = Promise<{ characterId: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    
    try {
        const { characterId } = await params;
        const character = await getCharacter(characterId);

        return {
            title: `${character.name}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing Characters`,
        }   
    }
}

export async function generateStaticParams() {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    const { data: popularCharacters, error } = await client
        .from("characters")
        .select("id")
        .order("chats", { ascending: false })
        .range(0, 10);


    if(error) {
        console.error("Error in c/characterId generateStaticParams: ", error);
        throw new Error("Error fetching popular characters");
    }

    const { data: newestCharacters, error: error2} = await client
        .from("characters")
        .select("id")
        .order("created_at", { ascending: false })
        .range(0, 5);   

    if(error2) {
        console.error("Error in c/characterId generateStaticParams: ", error2);
        throw new Error("Error fetching newest characters");
    }

    const { data: trendingCharacters, error: error3} = await client
        .from("characters_ordered_by_chats")
        .select("id")
        .order("recent_chat_count", { ascending: false })
        .range(0, 5);

    if(error3) {
        console.error("Error in c/characterId generateStaticParams: ", error3);
        throw new Error("Error fetching trending characters");
    }

    return [...popularCharacters, ...newestCharacters, ...trendingCharacters].map((character) => ({ characterId: character.id }));
}

export default async function CharacterView({ params }: { params: Params }) {

    const { characterId } = await params;

    const character = await getCharacter(characterId);
    const stories = await getCharacterStories(characterId);

    const transformedCharacter: Character = character;
    if(character.hide_definition) {
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
        <div className="relative w-full h-full min-h-full">
            <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden">

                <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-75 overflow-hidden">
                    <Image src={safeParseLink(character.image_link)} layout="fill" className="object-cover" alt="" />
                </div>

                <div className="flex flex-row max-lg:flex-col gap-6 items-start max-lg:items-center justify-center w-full">

                    <div className="flex flex-col justify-center gap-4 max-lg:w-full">
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <ImageWithBlur 
                                src={character.image_link} 
                                className="w-32 h-32" 
                                alt={character.name} 
                                sizes="128px" 
                                width={128}
                                height={128}
                                radius="rounded-full"
                                is_nsfw={character.is_nsfw}
                            />
                            <h1 className="text-xl font-bold">{character.name}</h1>
                            <Username profile={character.owner} hasLink textSize="sm" />
                        </div>

                        <div className="w-full flex items-center justify-center gap-2">
                            <CharacterPageActions 
                                character={character}
                            />
                        </div>

                        {character.is_private && 
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
                                <span>{character.chats} Chats</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Icon downscale filled>favorite</Icon>
                                <span>{character.likes} Likes</span>
                            </div>
                        </div>

                        <div className="prose dark:prose-invert prose-p:text-sm dark:prose-p:text-neutral-400 !select-none">
                            <Markdown>{character.description}</Markdown>
                        </div>
                        
                        <div className="flex flex-row flex-wrap items-center gap-2">
                            <CategoryCard data={character.category} />
                            {character.speaker_link &&
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
                            {character.tags_full?.map(tag => (
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
                        stories={stories}
                    />
                    </div>
                </div>
            </div>
        </div>
        
        </>
    )

}