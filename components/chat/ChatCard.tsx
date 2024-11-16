"use client";

import Link from "next/link";
import { Card, CardBody, CardFooter } from "@nextui-org/card";

import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import BlurModal from "../utils/BlurModal";
import { useState } from "react";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
import { Input } from "@nextui-org/input";


type Props = {
    chat: Chat;
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export default function ChatCard(props: Props) {
    const [chat, setChat] = useState(props.chat);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleDeleteChat = async () => {
        setIsDeleting(true);
        try {
            await deleteChat(props.chat.id);
            props.setChats((prev) => prev.filter((chat) => chat.id !== props.chat.id));
        } catch (error) {
            console.error(error);
        }
        setIsDeleting(false);
    }

    const handleEditChat = async () => {
        setIsSaving(true);

        await updateChat(chat);
        props.setChats((prev) => prev.map((c) => c.id === chat.id ? chat : c));

        setIsModalOpen(false);
        setIsSaving(false);
    }

    return (
        <>
       
        <Card>
            <CardBody className="flex flex-row gap-2 items-center justify-between">

                <div className="flex flex-col">
                    <h3 className="font-bold text-lg">{props.chat.title}</h3>
                    <p className="dark:text-slate-400">{props.chat.description}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsModalOpen(true)} variant="light" color="warning" isIconOnly><Icon>edit</Icon></Button>
                    <Link key={props.chat.id} href={`/chat/${props.chat.id}`}>
                        <Button variant="flat" color="primary" size="lg"><Icon filled>play_circle</Icon>Chat</Button>
                    </Link>
                </div>
        
            </CardBody>

            <CardFooter>
                <p className="dark:text-slate-400">Last message on {new Date((props.chat.last_message_at ?? "")).toLocaleDateString()}</p>
            </CardFooter>
        </Card>
    
        <BlurModal 
            isOpen={isModalOpen} 
            updateOpen={setIsModalOpen}
            header={<h2>Edit chat</h2>}
            body={
                <div className="flex flex-col gap-4">
                    <TextareaWithCounter
                        name="title"
                        label="Title"
                        isRequired
                        value={chat.title}
                        onValueChange={(value) => setChat((prev) => ({...prev, title: value}))}
                        maxLength={30}
                        maxRows={1}
                    />
                    <TextareaWithCounter 
                        name="description" 
                        label="Description" 
                        isRequired
                        value={chat.description} 
                        onValueChange={(value) => setChat((prev) => ({...prev, description: value}))}
                        maxLength={80}
                    />
                    <Input type="password" label="Chat password" description="(Optional) Used to encrypt the chat" isDisabled />
                </div>
            }
            footer={
                <>
                    <SaveDeleteButton 
                        onDelete={handleDeleteChat} 
                        isLoading={isDeleting} 
                        isDisabled={isSaving}
                    />
                    
                    <Button 
                        onClick={handleEditChat} 
                        color="primary" 
                        size="lg" 
                        isLoading={isSaving}
                        startContent={<Icon filled>save</Icon>}
                    >
                        Save
                    </Button>
                </>
            }
        />

        </>
    )
}