"use client";

import Image from "next/image";
import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react";
import { Story } from "@/types/db";
import ConditionalLink from "../utils/ConditionalLink";
import { truncateText } from "@/lib/utils";

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
                        h-full w-[300px] dark:bg-zinc-800/40 backdrop-blur-xl border-none shadow-none
                        ${props.fullWidth && "w-full"}
                        ${props.noBg && "dark:bg-transparent"} 
                    `}>
                    <CardBody className="flex flex-row gap-4 ">

                        <div className="flex items-center justify-center">
                            <div className="relative h-[100%] w-[70px] overflow-hidden rounded-2xl">
                                <Image className="relative object-cover" layout="fill" src={props.data.image_link ?? ""} alt={props.data.title} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 justify-between">
                            <h3 className="text-sm">{truncateText(props.data.title,50)}</h3>
                            <span className="text-xs dark:text-zinc-400">with {truncateText(props.data.character.name,40)}</span>
                        </div>

                    </CardBody>
                </Card>
            </motion.div>
        </ConditionalLink>
        </>
    )
}