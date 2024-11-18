"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { Avatar } from "@nextui-org/avatar";
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

type Props = {
    character: Character,
    stories: Story[],
    profile?: Profile
}

export default function CharacterPage(props: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    return (
        <>
        <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6">

            <div className="flex flex-row max-md:flex-col gap-6 items-center justify-center w-full">

                <div className="flex flex-col justify-center gap-4 max-md:w-full">
                    <div className="flex flex-col gap-2 items-center justify-center">
                        <Avatar src={props.character.image_link} className="w-32 h-32 text-large"/>
                        <h1 className="text-xl font-bold">{props.character.name}</h1>
                        <p className="text-sm dark:text-neutral-400">By @{props.character.owner.username}</p>
                    </div>

                    <div className="w-full flex items-center max-md:justify-center gap-2">
                        <Button 
                            onClick={handleStartChat} 
                            size="lg" color="primary" 
                            isLoading={isLoading}
                            radius="full"
                        >
                            Start Chat
                        </Button>
                        { props.profile?.user == props.character.owner.user &&
                            <Link href={`/c/${props.character.id}/edit`}>
                                <Button
                                    color="warning" isDisabled={isLoading}
                                    size="lg" variant="flat" radius="full"                        
                                >
                                    Edit
                                </Button>
                            </Link>
                        }
                    </div>

                    <div className="flex flex-col gap-2 text-sm dark:text-zinc-200">
                        
                        <div className="flex items-center gap-2">
                            <Icon downscale filled>chat_bubble</Icon>
                            <span>30m Chats</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Icon downscale filled>favorite</Icon>
                            <span>123k Likes</span>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert prose-p:text-sm dark:prose-p:text-neutral-400">
                        <p>{props.character.description}</p>
                    </div>

                    <CategoryCard category={props.character.category} />
                
                </div>




                <div className="flex flex-col max-md:w-full">
                    <Tabs variant="underlined"
                        classNames={{
                            cursor: "dark:bg-zinc-400",
                        }}
                    >
                        <Tab key="about" title="About">
                            <div className="w-full flex justify-start items-start flex-col prose dark:prose-invert prose-p:text-sm dark:prose-p:text-zinc-400 prose-h3:mt-0">
                                <h2>About</h2>
                                <h3>Introduction</h3>
                                <p>{props.character.intro || "No Introduction"}</p>
                                <h3>Bio</h3>
                                <p>{props.character.bio}</p>
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
                                    <StoryCard key={story.id} story={story} hasLink fullWidth />
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