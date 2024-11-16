"use client";

import Link from "next/link";
import { Card, CardBody } from "@nextui-org/card";

import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";


type Props = {
    chat: Chat;
}

export default function ChatCard(props: Props) {

    return (
        <>
       
            <Card>
                <CardBody className="flex flex-row gap-2 items-center justify-between">

                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg">{props.chat.title}</h3>
                        <p className="dark:text-slate-400">{props.chat.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="light" color="danger" isIconOnly><Icon>delete</Icon></Button>
                        <Button variant="light" color="warning" isIconOnly><Icon>edit</Icon></Button>
                        <Link key={props.chat.id} href={`/chat/${props.chat.id}`}>
                            <Button variant="flat" color="primary" isIconOnly size="lg"><Icon filled>play_circle</Icon></Button>
                        </Link>
                    </div>
               
                </CardBody>
            </Card>
        
        </>
    )
}