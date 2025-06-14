"use client";

import Link from "next/link";
import { Character } from "@/types/db";
import Icon from "../utils/Icon";
import StoryCard from "../story/StoryCard";
import { Story } from "@/types/db";
import { Button } from "../utils/Button";
import Markdown from "react-markdown";


type Props = {
    character: Character;
    stories: Story[];
}

export default function CharacterPageTabs(props: Props) {

    return (
        <>
        <Tabs variant="underlined"
            classNames={{
                cursor: "dark:bg-zinc-400",
            }}
        >
            <Tab key="about" title="About">
                {props.character.hide_definition ?
                <div className=" w-[500px] relative">
                    <p>This Character&apos;s definition is hidden.</p>
                </div>
                :
                <div className="w-full flex justify-start items-start flex-col prose dark:prose-invert prose-p:text-sm dark:prose-p:text-zinc-400 prose-h3:mt-0 prose-h2:m-0 prose-hr:m-0 !select-none">
                    {(props.character.intro) && 
                    <>
                    <h3>Introduction</h3>
                    <p className=" !text-red-500 dark:!text-red-500 !m-0 !p-0">Notice: Character introductions are deprecated and should be moved to the Greeting instead. This will still work, for now.</p>
                    <Markdown>{props.character.intro}</Markdown>
                    </>
                    }

                    {( props.character.first_message) && 
                    <>
                    <h3>Greeting / First message</h3>
                    <Markdown>{props.character.first_message}</Markdown>
                    </>
                    }

                    {props.character.bio &&
                    <>
                    <h3>Bio</h3>
                    <Markdown>{props.character.bio}</Markdown>
                    </>
                    }

                    {props.character.personality &&
                    <>
                    <h3>Personality</h3>
                    <Markdown>{props.character.personality}</Markdown>
                    </>
                    }

                    {props.character.scenario &&
                    <>
                    <h3>Scenario</h3>
                    <Markdown>{props.character.scenario}</Markdown>
                    </>
                    }

                    <Accordion className=" prose-h2:m-0">
                        <AccordionItem title="Character Book" className="prose-h2:m-0 prose-p:m-0" classNames={{
                            title: "m-0 prose-h2:m-0"
                        }}>
                            <p>{props.character.book ?? "This character has no character book."}</p>
                        </AccordionItem>
                        <AccordionItem title="System Prompt" className="prose-h2:m-0 prose-p:m-0" classNames={{
                            title: "m-0 prose-h2:m-0"
                        }}>
                            <p>{props.character.system_prompt ?? "This character has no customized system prompt."}</p>
                        </AccordionItem>
                        <AccordionItem title="Image Prompt" className="prose-h2:m-0 prose-p:m-0" classNames={{
                            title: "m-0 prose-h2:m-0"
                        }}>
                            <p>{props.character.image_prompt ?? "This character has no customized image prompt."}</p>
                        </AccordionItem>
                    </Accordion>

                </div>
                }
            </Tab>
            <Tab key="stories" title="Stories">
                <div className="flex flex-row items-center justify-between ">
                    <h2 className="font-bold text-xl">Stories with {props.character.name}</h2>
                    <Link href={`/c/${props.character.id}/story/new`}>
                        <Button variant="light" color="warning" isIconOnly>
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
        </>
    )
}