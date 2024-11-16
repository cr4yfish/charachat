"use client";

import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react"

import { Chat, Message } from "@/types/db";
import { useEffect, useState } from "react";
import { getLatestChatMessage } from "@/functions/db/messages";
import { Skeleton } from "../ui/skeleton";
import { formatLastMessageTime, truncateText } from "@/lib/utils";
import { Avatar } from "@nextui-org/avatar";
import ConditionalLink from "../utils/ConditionalLink";

type Props = {
    chat: Chat;
    setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
    hasLink?: boolean;
}

export default function ChatCardSmall(props: Props) {

    const [latestMessage, setLatestMessage] = useState<Message>();
    const [isLoadingLatestMessage, setIsLoadingLatestMessage] = useState(true);

    useEffect(() => {
        const getLatestMessage = async () => {
            setIsLoadingLatestMessage(true);

            const key = sessionStorage.getItem("key");

            if(!key) {
                console.error("No key found in session storage");
                return;
            }

            const res = await getLatestChatMessage(props.chat.id, key);
            if(res !== null) {
                setLatestMessage(res);
            }
            setIsLoadingLatestMessage(false);
        }
        getLatestMessage();
    }, [props.chat])

    return (
        <>
        <ConditionalLink active={props.hasLink !== undefined} href={`/chat/${props.chat.id}`}>
            <Card isPressable={props.hasLink} className="w-full">
                <CardBody className="flex flex-row gap-2 items-center justify-start">

                    <Avatar src={props.chat.character.image_link} size="md" />

                    <div className="flex flex-col w-full">
                        <div className="flex flex-row items-center justify-between w-full">
                            <h3 className="font-bold text-lg">{props.chat.character.name}</h3>
                            {props.chat.last_message_at && 
                                <span className="text-xs dark:text-slate-400">{formatLastMessageTime(new Date(props.chat.last_message_at))}</span>
                            }
                        </div>
                        
                        {isLoadingLatestMessage && 
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Skeleton className="w-full h-5" />
                            </motion.div>
                        }
                        {!isLoadingLatestMessage && latestMessage?.content && 
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="dark:text-slate-400 single-line text-sm"
                            >
                                {truncateText(latestMessage.content, 40)}
                            </motion.p>
                        }
                    </div>

                </CardBody>

            </Card>
        </ConditionalLink>
        </>
    )
}