"use client";

import { motion } from "motion/react";
import Image from "next/image"
import { Card, CardBody } from "@nextui-org/card";
import { Persona } from "@/types/db";
import ConditionalLink from "../utils/ConditionalLink";
import { safeParseLink, truncateText } from "@/lib/utils";
import Icon from "../utils/Icon";
import Markdown from "react-markdown";

type Props = {
    data: Persona,
    hasLink: boolean,
    fullWidth?: boolean,
    isSmall?: boolean,
    noBg?: boolean
}

export default function PersonaCard(props: Props) {

    return (
        <>
        <ConditionalLink active={props.hasLink} href={`/persona/${props.data.id}`} fullWidth={props.fullWidth}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                <Card 
                    isPressable={props.hasLink} 
                    className={`
                        h-[150px] w-[310px] dark:bg-zinc-800/40 backdrop-blur-xl border-none shadow-none
                        dark:hover:bg-zinc-700/40
                        ${props.fullWidth && "w-full"} 
                        ${props.isSmall && "h-full"}
                        ${props.noBg && "dark:bg-transparent"} 
                    `}>
                    <CardBody className="flex flex-row gap-4">
                        
                        <div className="flex items-center justify-center">
                            <div className="relative h-[100%] w-[100px] overflow-hidden rounded-2xl">
                                <Image className="relative object-cover" layout="fill" src={safeParseLink(props.data?.avatar_link)} alt={props.data.full_name} />
                            </div>
                        </div>

                        <div className="flex flex-col justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <div className="flex flex-col">
                                        <h3 className="font-medium">{truncateText(props.data.full_name,40)}</h3>
                                    </div>
                                    <p className=" text-xs dark:text-zinc-400">By @{props.data.creator?.username}</p>
                                </div>
                                <Markdown className="text-xs max-w-md">{truncateText(props.data.bio ?? "", props.fullWidth ? 80 : 40)}</Markdown> 
                            </div>

                         
                            <div className="flex flex-row items-center gap-2">
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