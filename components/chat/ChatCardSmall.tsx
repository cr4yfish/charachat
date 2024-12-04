"use client";

import { Card, CardBody } from "@nextui-org/card";
import { usePathname } from "next/navigation";

import { Chat } from "@/types/db";
import { useEffect, useState } from "react";
import { formatLastMessageTime, truncateText } from "@/lib/utils";
import { Avatar } from "@nextui-org/avatar";
import ConditionalLink from "../utils/ConditionalLink";

type Props = {
    data: Chat;
    setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
    hasLink?: boolean;
}

export default function ChatCardSmall(props: Props) {
    const pathname = usePathname();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if(pathname && props.data.id) {
            setIsActive(pathname.includes(`/chat/${props.data.id}`));
        }
    }, [pathname, props.data])

    return (
        <>
        <ConditionalLink fullWidth active={props.hasLink !== undefined} href={`/chat/${props.data.id}`}>
            <Card 
                isPressable={props.hasLink} shadow="none"
                className={`
                    w-full bg-transparent 
                    hover:bg-zinc-100 dark:hover:bg-zinc-800
                    ${isActive && "bg-primary-100 dark:bg-primary"}`
                }
            >
                <CardBody className="flex flex-row gap-2 items-center justify-start">

                    <Avatar src={props.data.character.image_link} className="w-[50px]" />

                    <div className="flex flex-col w-full">
                        <h3 className="text-sm dark:text-zinc-300">{props.data.character.name}</h3>
                        <div className="flex justify-between items-center">
                            <p className={`single-line text-xs ${isActive ? "dark:text-blue-200" : "dark:text-slate-400"}`} >
                                {truncateText(props.data.last_message ?? "", 10)}
                            </p>
                            {props.data.last_message_at && 
                            <span className={`text-xs  ${isActive ? "dark:text-blue-200" : "dark:text-slate-400"}`} >
                                {formatLastMessageTime(new Date(props.data.last_message_at))}
                            </span>
                            }
                        </div>
                    </div>

                </CardBody>

            </Card>
        </ConditionalLink>
        </>
    )
}