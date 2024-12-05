"use client";

import { motion } from "motion/react";
import Image from "next/image"
import { Card, CardBody } from "@nextui-org/card";
import { Character } from "@/types/db";
import ConditionalLink from "../utils/ConditionalLink";
import { safeParseLink, truncateText } from "@/lib/utils";
import Icon from "../utils/Icon";
import Markdown from "react-markdown";
import Username from "../user/Username";

type Props = {
    data: Character,
    hasLink: boolean,
    fullWidth?: boolean,
    isSmall?: boolean,
    noBg?: boolean
}

export default function CharacterCard(props: Props) {

    return (
        <>
        <ConditionalLink active={props.hasLink} href={`/c/${props.data.id}`} fullWidth={props.fullWidth}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <Card 
                    isPressable={props.hasLink} 
                    className={`
                        h-[150px] w-[310px] bg-zinc-100/40 dark:bg-zinc-800/40 backdrop-blur-xl border dark:border-none shadow-none
                        hover:bg-zinc-200/50 dark:hover:bg-zinc-700/40
                        ${props.fullWidth && "w-full"} 
                        ${props.isSmall && "h-full"}
                        ${props.noBg && "dark:bg-transparent"} 
                    `}>
                    <CardBody className="flex flex-row gap-4">
                        
                        <div className="flex items-center justify-center">
                            <div className="relative h-[100%] w-[100px] overflow-hidden rounded-2xl">
                                <Image 
                                    className="relative object-cover" 
                                    fill
                                    src={safeParseLink(props.data.image_link)} 
                                    alt={props.data.name ?? "avatar"} 
                                    sizes="100px"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <h3 className="font-medium">{truncateText(props.data.name,40)}</h3>
                                    <Username profile={props.data.owner} />
                                </div>
                                <Markdown className="text-xs max-w-md">{truncateText(props.data.description, props.fullWidth ? 80 : 40)}</Markdown> 
                            </div>

                         
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