"use client";

import Image from "next/image";
import { Card, CardBody } from "@nextui-org/card";

import { Story } from "@/types/db";
import ConditionalLink from "../utils/ConditionalLink";
import Icon from "../utils/Icon";

type Props = {
    story: Story;
    hasLink: boolean;
    fullWidth?: boolean;
}

export default function StoryCardSmall(props: Props) {

    return (
        <>
       <ConditionalLink active={props.hasLink} href={`/c/${props.story.character.id}/story/${props.story.id}`}>
            <Card isPressable={props.hasLink} className={`h-full w-[300px] dark:bg-zinc-800 ${props.fullWidth && "w-full"}`}>
                <CardBody className="flex flex-row gap-4 ">

                    <div className="flex items-center justify-center">
                        <div className="relative h-[100%] w-[100px] overflow-hidden rounded-2xl">
                            <Image className="relative" objectFit="cover" layout="fill" src={props.story.image_link ?? ""} alt={props.story.title} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 justify-between">
                        <div className="flex flex-col">
                            <h3 className="font-bold">{props.story.title}</h3>
                            
                        </div>
                        
                        <div className="flex flex-row items-center gap-2 text-xs dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                                <Icon downscale filled>chat_bubble</Icon>
                                30.0m
                            </span>
                            <span className="flex items-center gap-1">
                                <Icon downscale filled>account_circle</Icon>
                                {props.story.creator.username}
                            </span>
                        </div>
                        
                    </div>

                </CardBody>

            </Card>
        </ConditionalLink>
        </>
    )
}