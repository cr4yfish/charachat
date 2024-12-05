"use client";

import { motion } from "motion/react";
import Image from "next/image"
import { Card, CardBody } from "@nextui-org/card";
import { Persona } from "@/types/db";
import ConditionalLink from "../utils/ConditionalLink";
import { safeParseLink, truncateText } from "@/lib/utils";
import Icon from "../utils/Icon";
import Markdown from "react-markdown";
import { Avatar } from "@nextui-org/avatar";
import Username from "../user/Username";

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
                        ${props.isSmall && "h-[75px]"}
                        ${props.noBg && "dark:bg-transparent"} 
                    `}>
                    <CardBody className={`flex flex-row gap-4 ${props.isSmall && "items-center"}`}>
                        
                        {!props.isSmall &&
                        <div className="flex items-center justify-center">
                            <div className="relative h-[100%] w-[100px] overflow-hidden rounded-2xl">
                                <Image className="relative object-cover" layout="fill" src={safeParseLink(props.data?.avatar_link)} alt={props.data.full_name} />
                            </div>
                        </div>
                        }

                        {props.isSmall && <Avatar src={safeParseLink(props.data?.avatar_link)} className="min-w-[40px]" />}

                        <div className={`flex flex-col justify-between ${props.isSmall && "w-full !flex-row pr-2"}`}>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <h3 className="font-medium">{truncateText(props.data.full_name,40)}</h3>
                                    <Username profile={props.data.creator} />
                                </div>
                                {!props.isSmall && <Markdown className="text-xs max-w-md">{truncateText(props.data.bio ?? "", props.fullWidth ? 80 : 40)}</Markdown> }
                            </div>

                         
                            { props.data.is_private &&
                                <div className="flex items-center gap-1">
                                    <Icon color="green-500" downscale filled>lock</Icon>
                                    <span className="text-xs text-green-500">Private</span>
                                </div>
                            }
                            
                        </div>
                    </CardBody>
                </Card>
            </motion.div>
        </ConditionalLink>
        </>
    )
}