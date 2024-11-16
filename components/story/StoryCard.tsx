"use client";

import { Image } from "@nextui-org/image";
import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react"

import { Story } from "@/types/db";
import { formatLastMessageTime, truncateText } from "@/lib/utils";
import { Avatar } from "@nextui-org/avatar";
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
            <Card isPressable={props.hasLink} className={`h-full w-[300px] ${props.fullWidth && "w-full"}`}>
                <CardBody className="flex flex-row gap-4 ">

                    <div>
                        <Image height={100} width={100} src={props.story.image_link} alt={props.story.title} />
                    </div>

                    <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                            <div className="flex flex-col">
                                <div className="flex flex-col">
                                    <h3 className="font-bold">{props.story.title}</h3>
                                    
                                </div>
                            </div>
                            <p className=" text-sm dark:text-slate-400">{truncateText(props.story.description, 30)}</p>
                        </div>
                        
                        <div className="flex flex-row items-center gap-2 text-xs dark:text-slate-400">
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