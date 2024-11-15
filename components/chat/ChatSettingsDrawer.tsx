"use client";


import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";

type Props = {
    chat: Chat
}

export default function ChatSettingsDrawer(props: Props) {

    return (
        <>
        <Drawer>
            <DrawerTrigger asChild>
                <Button isIconOnly variant="light" className="justify-start">
                    <Icon filled>settings</Icon>
                </Button>
            </DrawerTrigger>
            <DrawerContent>

                <DrawerHeader>
                    <DrawerTitle>Settings for {props.chat.character.name} Chat</DrawerTitle>
                    <DrawerDescription>Configure your chat</DrawerDescription>
                </DrawerHeader>

                

            </DrawerContent>
            
        </Drawer>
        
        </>
    )
}