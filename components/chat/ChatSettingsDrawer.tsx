"use client";

import { Input } from "@nextui-org/input";
import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import CharacterCard from "@/components/character/CharacterCard";
import { updateChat } from "@/functions/db/chat";


type Props = {
    chat: Chat
}

export default function ChatSettingsDrawer(props: Props) {

    const [chat, setChat] = useState<Chat>(props.chat)
    const [isChanged, setIsChanged] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdateChat = async () => {
        setIsLoading(true)
        try {
            await updateChat(chat)
            setIsChanged(false)
        } catch (error) {
            console.error(error)
        }
        
        setIsLoading(false)
    }

    const handleUpdateValue = (key: string, value: string) => {
        setChat({...chat, [key]: value})
        setIsChanged(true)
    }

    return (
        <>
        <Drawer>
            <DrawerTrigger asChild>
                <Button isIconOnly variant="light" className="justify-start">
                    <Avatar src={chat.character.image_link} />
                </Button>
            </DrawerTrigger>
            <DrawerContent>

                <DrawerHeader>
                    <DrawerTitle>Settings for {props.chat.character.name} Chat</DrawerTitle>
                    <DrawerDescription>Configure your chat</DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col px-4 gap-4">
                    <CharacterCard hasLink={false} character={props.chat.character} />
                    <div className="flex flex-col gap-2">
                        <Input 
                            label="Chat Name" 
                            placeholder="Enter a name for your chat" 
                            value={chat.title} 
                            onValueChange={(value) => handleUpdateValue("title", value)}
                            isDisabled={isLoading}
                            minLength={4} maxLength={50} 
                        />
                        <Input 
                            label="Chat Description" 
                            placeholder="Enter a description for your chat" 
                            value={chat.description} 
                            onValueChange={(value) => handleUpdateValue("description", value)}
                            isDisabled={isLoading}
                            minLength={4} maxLength={128} 
                        />
                        <Button 
                            onClick={handleUpdateChat} 
                            isDisabled={!isChanged}
                            isLoading={isLoading}
                            variant="flat" color="primary"
                        >
                            Update chat
                        </Button>
                    </div>
               
                </div>
                
                <DrawerFooter></DrawerFooter>

            </DrawerContent>
            
        </Drawer>
        
        </>
    )
}