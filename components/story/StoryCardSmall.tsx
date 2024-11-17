"use client";

import Image from "next/image";
import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react"

import { Story } from "@/types/db";
import { truncateText } from "@/lib/utils";

type Props = {
    story: Story
}

export default function StoryCardSmall(props: Props) {

    return (
        <>
       
        <Card>
            <CardBody className="flex flex-row gap-2 items-center justify-start">


                <div className="flex items-center justify-center">
                    <div className="relative h-[100%] w-[50px] overflow-hidden rounded-2xl">
                        <Image className="relative" objectFit="cover" layout="fill" src={props.story.image_link ?? ""} alt={props.story.title} />
                    </div>
                </div>


                <div className="flex flex-col w-full">
                    <div className="flex flex-row items-center justify-between w-full">
                        <h3 className="font-bold text-lg">{props.story.title}</h3>
                    </div>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="dark:text-slate-400 single-line text-sm"
                    >
                        {truncateText(props.story.story, 40)}
                    </motion.p>
                    
                </div>

            </CardBody>

        </Card>

        </>
    )
}