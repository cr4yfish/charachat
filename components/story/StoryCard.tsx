"use client";

import Image from "next/image";
import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react";
import { Story } from "@/types/db";
import ConditionalLink from "../utils/ConditionalLink";
import { safeParseLink, truncateText } from "@/lib/utils";
import Icon from "../utils/Icon";

type Props = {
    data: Story;
    hasLink: boolean;
    fullWidth?: boolean;
    noBg?: boolean
}

export default function StoryCard(props: Props) {

    if(!props.data?.id) {
        return null;
    }

    return (
        <>
       <ConditionalLink active={props.hasLink} href={`/c/${props.data.character.id}/story/${props.data.id}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <Card 
                    isPressable={props.hasLink} 
                    className={`
                        h-[125px] w-[300px] dark:bg-zinc-800/40 backdrop-blur-xl border-none shadow-none
                        dark:hover:bg-zinc-700/40
                        ${props.fullWidth && "w-full"}
                        ${props.noBg && "dark:bg-transparent"} 
                    `}>
                    <CardBody className="flex flex-row gap-4 ">

                        <div className="flex items-center justify-center">
                            <div className="relative h-[100%] w-[70px] overflow-hidden rounded-2xl">
                                <Image className="relative object-cover" layout="fill" src={safeParseLink(props.data.image_link)} alt={props.data.title} />
                            </div>
                            
                        </div>

                        <div className="flex flex-col gap-1 justify-start">
                            <h3 className="text-sm">{truncateText(props.data.title,50)}</h3>
                            <span className="text-xs dark:text-zinc-400">with {truncateText(props.data.character.name,40)}</span>
                       
                            
                            <div className="flex flex-row items-center gap-2">
                                {((props.data.chats !== undefined) && (props.data.likes !== undefined)) &&
                                <>
                                    <div className="flex items-center gap-1 text-xs dark:text-zinc-400">
                                        <Icon downscale>chat_bubble</Icon>
                                        <span>{props.data.chats}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs dark:text-zinc-400">
                                        <Icon downscale>favorite</Icon>
                                        <span>{props.data.likes}</span>
                                    </div>
                                </>
                                }
                                {props.data.is_private &&
                                    <div className="flex gap-1 items-center">
                                        <Icon color="green-500" downscale filled>lock</Icon>
                                        <span className="text-xs text-green-500">Private</span>
                                    </div>
                                }
                            </div>
                            
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        </ConditionalLink>
        </>
    )
}