"use client";

import Link from "next/link";
import { Card, CardBody } from "@nextui-org/card";

import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import BlurModal from "../utils/BlurModal";
import { useState } from "react";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
import { Input } from "@nextui-org/input";
import { Avatar } from "@nextui-org/avatar";
import { Switch } from "@nextui-org/switch";


type Props = {
    data: Chat;
    setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
}

export default function ChatCard(props: Props) {
    const [chat, setChat] = useState(props.data);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleDeleteChat = async () => {
        setIsDeleting(true);
        try {
            await deleteChat(props.data.id);
            if(props.setChats) props.setChats((prev) => prev.filter((chat) => chat.id !== props.data.id));
        } catch (error) {
            console.error(error);
        }
        setIsDeleting(false);
    }

    const handleEditChat = async () => {
        setIsSaving(true);

        await updateChat(chat);
        if(props.setChats) props.setChats((prev) => prev.map((c) => c.id === chat.id ? chat : c));

        setIsModalOpen(false);
        setIsSaving(false);
    }

    return (
        <>
       
        <Card 
            className={`
                w-full bg-transparent 
                hover:bg-zinc-800
            `}
        >
            <CardBody className="flex flex-row gap-2 items-center justify-start w-full">
                
                <Avatar src={chat.character.image_link} />
                
                <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg">{chat.title}</h3>
                        <p className="dark:text-zinc-400">{chat.description}</p>
                        <p className="dark:text-zinc-400 text-xs">Last message on {new Date((chat.last_message_at ?? "")).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsModalOpen(true)} variant="light" color="warning" isIconOnly><Icon>edit</Icon></Button>
                        <Link key={props.data.id} href={`/chat/${props.data.id}`}>
                            <Button variant="flat" color="primary" size="lg"><Icon filled>play_circle</Icon>Chat</Button>
                        </Link>
                    </div>
                </div>

        
            </CardBody>

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
                    <Switch isDisabled>Local only</Switch>
                </div>
            }
            footer={
                <>  
                <div>
                    <SaveDeleteButton 
                        onDelete={handleDeleteChat} 
                        isLoading={isDeleting} 
                        isDisabled={isSaving}
                    />
                </div>  

                <Button 
                    onClick={handleEditChat} 
                    color="primary" 
                    size="lg" 
                    fullWidth
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