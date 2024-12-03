"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Avatar } from "@nextui-org/avatar";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Tabs, Tab } from "@nextui-org/tabs";
import Link from "next/link";
import { Profile, Story } from "@/types/db";
import StoryCard from "../story/StoryCard";
import { Button } from "@/components/utils/Button";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/utils/Icon";

import { Character } from "@/types/db";
import { createChat } from "@/functions/db/chat";
import CategoryCard from "./CategoryCard";
import Image from "next/image";
import Markdown from "react-markdown";
import { likeCharacter, unlikeCharacter } from "@/functions/db/character";
import { safeParseLink } from "@/lib/utils";
import { Card, CardBody } from "@nextui-org/card";

type Props = {
    character: Character,
    stories: Story[],
    profile?: Profile
}

export default function CharacterPage(props: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const [isLiked, setIsLiked] = useState<boolean>(props.character.is_liked ?? false);

    const handleStartChat = async () => {
        if(!props.profile) {
            console.error("No profile found");
            toast({
                title: "Error",
                description: "You need to be logged in to start a chat",
                variant: "destructive"
            })
            return;
        }
        setIsLoading(true);

        const characterId = props.character.id;
    
        const chat = await createChat({
            chatId: uuidv4(),
            userId: props.profile.user,
            characterId: characterId,
            title: "New Chat",
            description: "This is a new chat"
        });
    
        if(!chat) {
            throw new Error("Failed to create chat");
        }

        router.replace(`/chat/${chat.id}`);
    }

    const handleLike = async () => {
        setIsLiking(true);

        try {
            if(isLiked) {
                await unlikeCharacter(props.character.id);
            } else {
                await likeCharacter(props.character.id);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error("Failed to like character", error);
            toast({
                title: "Error",
                description: "Failed to like character",
                variant: "destructive"
            })
        } finally {
            setIsLiking(false);
        }
    }

    return (
        <>
        <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden">

            <div className=" -z-10 absolute top-0 left-0 w-full h-full blur-3xl opacity-75 overflow-hidden">
                <Image src={safeParseLink(props.character.image_link)} layout="fill" className="object-cover" alt="" />
            </div>

            <div className="flex flex-row max-md:flex-col gap-6 items-start max-md:items-center justify-center w-full">

                <div className="flex flex-col justify-center gap-4 max-md:w-full">
                    <div className="flex flex-col gap-2 items-center justify-center">
                        <Avatar src={props.character.image_link} className="w-32 h-32 text-large"/>
                        <h1 className="text-xl font-bold">{props.character.name}</h1>
                        <p className="text-sm dark:text-neutral-400">By @{props.character.owner.username}</p>
                    </div>

                    <div className="w-full flex items-center justify-center gap-2">
                        <Button 
                            onClick={handleStartChat} 
                            size="lg" color="primary" 
                            isLoading={isLoading}
                            radius="full"
                        >
                            Start Chat
                        </Button>
                        {props.profile?.user == props.character.owner.user ?
                            <Link href={`/c/${props.character.id}/edit`}>
                                <Button
                                    color="warning" isDisabled={isLoading}
                                    size="lg" variant="flat" radius="full"                        
                                >
                                    Edit
                                </Button>
                            </Link>
                            :
                            props.profile !== undefined ? 
                                <Button 
                                    color="danger" variant="flat" 
                                    radius="full" size="lg" 
                                    onClick={handleLike}
                                    isLoading={isLiking}
                                    isIconOnly
                                >
                                    <Icon filled={isLiked} >
                                        {isLiked ? "favorite" : "heart_plus"}
                                    </Icon>
                                </Button>
                            : null
                        }
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

                    <div className="prose dark:prose-invert prose-p:text-sm dark:prose-p:text-neutral-400">
                        <Markdown>{props.character.description}</Markdown>
                    </div>
                    
                    <div className="flex flex-row items-center gap-2">
                        <CategoryCard data={props.character.category} />
                        {props.character.speaker_link &&
                            <Card 
                                className={`
                                    w-full max-w-fit flex items-center justify-center px-4 py-3 rounded-full dark:bg-zinc-600/40
                                    backdrop-blur-xl border-1 dark:border-none shadow-none text-sm font-medium
                                `}
                                >
                                <CardBody className="p-0 w-full min-w-max h-full flex flex-row items-center justify-center">
                                    Has customized Voice
                                </CardBody>
                            </Card>
                        }
                    </div>
                </div>

                <div className="flex flex-col max-md:w-full">
                    <Tabs variant="underlined"
                        classNames={{
                            cursor: "dark:bg-zinc-400",
                        }}
                    >
                        <Tab key="about" title="About">
                            <div className="w-full flex justify-start items-start flex-col prose dark:prose-invert prose-p:text-sm dark:prose-p:text-zinc-400 prose-h3:mt-0 prose-h2:m-0 prose-hr:m-0">
                                {(props.character.intro) && 
                                <>
                                <h3>Introduction</h3>
                                <p>{props.character.intro}</p>
                                </>
                                }

                                {( props.character.first_message) && 
                                <>
                                <h3>Greeting / First message</h3>
                                <p>{props.character.first_message}</p>
                                </>
                                }

                                {props.character.bio &&
                                <>
                                <h3>Bio</h3>
                                <p>{props.character.bio}</p>
                                </>
                                }

                                {props.character.personality &&
                                <>
                                <h3>Personality</h3>
                                <p>{props.character.personality}</p>
                                </>
                                }

                                {props.character.scenario &&
                                <>
                                <h3>Scenario</h3>
                                <p>{props.character.scenario}</p>
                                </>
                                }

                                <Accordion className=" prose-h2:m-0">
                                    <AccordionItem title="Character Book" className="prose-h2:m-0 prose-p:m-0" classNames={{
                                        title: "m-0 prose-h2:m-0"
                                    }}>
                                        <p>{props.character.book}</p>
                                    </AccordionItem>
                                    <AccordionItem title="System Prompt">
                                        <p>{props.character.system_prompt}</p>
                                    </AccordionItem>
                                    <AccordionItem title="Image Prompt">
                                        <p>{props.character.image_prompt}</p>
                                    </AccordionItem>
                                </Accordion>
                                

                            </div>
                        </Tab>
                        <Tab key="stories" title="Stories">
                            <div className="flex flex-row items-center justify-between ">
                                <h2 className="font-bold text-xl">Stories with {props.character.name}</h2>
                                <Link href={`/c/${props.character.id}/story/new`}>
                                    <Button variant="light" color="warning" isIconOnly isDisabled={props.profile === undefined}>
                                        <Icon>add</Icon>
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                {props.stories.map((story: Story) => (
                                    <StoryCard key={story.id} data={story} hasLink fullWidth />
                                ))}

                                {props.stories.length == 0 && <p className="text-sm dark:text-neutral-400">No stories found. Want to make the first?</p>}
                            
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
                        


        </div>
        </>
    )

}