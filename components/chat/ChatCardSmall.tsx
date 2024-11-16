"use client";

import { Card, CardBody } from "@nextui-org/card";
import { motion } from "motion/react"

import { Chat, Message } from "@/types/db";
import { useEffect, useState } from "react";
import { deleteChat, updateChat } from "@/functions/db/chat";
import { getLatestChatMessage } from "@/functions/db/messages";
import { Skeleton } from "../ui/skeleton";
import { formatLastMessageTime, truncateText } from "@/lib/utils";
import { Avatar } from "@nextui-org/avatar";

type Props = {
    chat: Chat;
    setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export default function ChatCardSmall(props: Props) {

    const [latestMessage, setLatestMessage] = useState<Message>();
    const [isLoadingLatestMessage, setIsLoadingLatestMessage] = useState(true);
    
    const getLatestMessage = async () => {
        setIsLoadingLatestMessage(true);
        const res = await getLatestChatMessage(props.chat.id);
        if(res !== null) {
            setLatestMessage(res);
        }
        setIsLoadingLatestMessage(false);
    }

    useEffect(() => {
        getLatestMessage();
    }, [props.chat])

    return (
        <>
       
        <Card>
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

        </>
    )
}