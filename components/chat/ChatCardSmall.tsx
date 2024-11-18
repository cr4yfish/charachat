"use client";

import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react"
import { usePathname } from "next/navigation";

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
    loadLatestMessage?: boolean;
}

export default function ChatCardSmall(props: Props) {
    const pathname = usePathname();
    const [latestMessage, setLatestMessage] = useState<Message>();
    const [isLoadingLatestMessage, setIsLoadingLatestMessage] = useState(true);
    const [isActive, setIsActive] = useState(false);

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
        if(props.loadLatestMessage) {
            // this is stupid
            //getLatestMessage(); 
        }
    }, [props.chat])

    useEffect(() => {
        if(pathname && props.chat.id) {
            setIsActive(pathname.includes(`/chat/${props.chat.id}`));
        }
    }, [pathname, props.chat])

    return (
        <>
        <ConditionalLink active={props.hasLink !== undefined} href={`/chat/${props.chat.id}`}>
            <Card 
                isPressable={props.hasLink} shadow="none"
                className={`
                    w-full bg-transparent 
                    hover:bg-zinc-800
                    ${isActive && "bg-primary-100 dark:bg-primary"}`
                }
            >
                <CardBody className="flex flex-row gap-2 items-center justify-start">

                    <Avatar src={props.chat.character.image_link} size="md" />

                    <div className="flex flex-col w-full">
                        <div className="flex flex-row items-center justify-between w-full">
                            <h3 className="text-md">{props.chat.character.name}</h3>
                            {props.chat.last_message_at && 
                                <span 
                                    className={`
                                    text-xs dark:text-slate-400
                                    ${isActive && "dark:text-blue-200"}    
                                    `}
                                >
                                    {formatLastMessageTime(new Date(props.chat.last_message_at))}
                                </span>
                            }
                        </div>
                        
                        {isLoadingLatestMessage && props.loadLatestMessage &&
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Skeleton className="w-full h-5" />
                            </motion.div>
                        }
                        {!isLoadingLatestMessage && latestMessage?.content && props.loadLatestMessage && 
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`
                                    dark:text-slate-400 single-line text-sm
                                    ${isActive && "dark:text-blue-200"}    
                                `}
                            >
                                {truncateText(latestMessage.content, 20)}
                            </motion.p>
                        }
                    </div>

                </CardBody>

            </Card>
        </ConditionalLink>
        </>
    )
}