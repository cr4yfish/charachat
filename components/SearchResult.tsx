"use client";

import Link from "next/link";
import Markdown from "react-markdown";
import Icon from "./utils/Icon";
import { truncateText } from "@/lib/utils";
import { motion } from "motion/react";

type Props = {
    link: string;
    imageLink: string;
    title: string;
    description: string;
    owner: string;
}

export default function SearchResult(props: Props) {

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}    
        >
            <Link href={props.link} className="flex flex-row items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 w-full rounded-lg p-2">
                <Avatar src={props.imageLink} size="lg" />
                <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col">
                        <span className="font-medium">{props.title}</span>
                        <Markdown className="text-xs dark:text-zinc-400">{truncateText(props.description, 50)}</Markdown>
                    </div>
                    <div className="flex flex-row items-center gap-2 text-xs dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                            <Icon downscale filled>chat_bubble</Icon>
                            30.0m
                        </span>
                        <span className="flex items-center gap-1">
                            <Icon downscale filled>account_circle</Icon>
                            {props.owner}
                        </span>
                    </div> 
                </div>
            </Link>
        </motion.div>
    )
}