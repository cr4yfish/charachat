"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";

import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
import { Input } from "@nextui-org/input";
import { LLMs } from "@/lib/ai";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSharedChat } from "@/context/SharedChatSettings";
import Link from "next/link";


export default function ChatSettingsDrawer() {

    const { chat, setChat } = useSharedChat()

    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleDelete = async () => {
        if(!chat) return

        setIsDeleting(true)
        try {
            await deleteChat(chat.id)
            window.location.href = "/";
        } catch (e) {
            console.error(e)
            setIsDeleting(false)
        }
    }

    const handleUpdateChat = async () => {
        if(!chat) return
        setIsSaving(true)

        try {
            await updateChat(chat)
        } catch (e) {
            console.error(e)
        }
        setIsSaving(false)
        
    }

    return (
        <>             
        <Sheet>
            <SheetTrigger asChild>
                <Button isIconOnly variant="light" className="justify-start">
                    <Avatar src={chat?.character.image_link} />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-4">
                <SheetHeader className=" w-full items-start">
                    <SheetDescription>Chat with {chat?.character.name}</SheetDescription>
                    <SheetTitle>Chat Settings</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col gap-2">
                        <Input label="Chat Title" value={chat?.title} onValueChange={(value) => chat && setChat({...chat, title: value})} />
                        <Input label="Chat Description" value={chat?.description} onValueChange={(value) => chat && setChat({...chat, description: value})} />
                        <Select 
                            onValueChange={(value) => chat && setChat({...chat, llm: value})}
                            defaultValue={chat?.llm}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select an AI" />
                            </SelectTrigger>
                            <SelectContent>
                                {LLMs.map((llm) => (
                                    <SelectItem key={llm.key} value={llm.key}>{llm.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>

                    <div className="flex flex-col gap-2">
                        { (chat?.character.owner.user == chat?.user.user) && (
                            <Link href={`/c/${chat?.character.id}/edit`}>
                                <Button
                                    size="lg" fullWidth
                                    startContent={<Icon filled>edit</Icon>}
                                    color="warning"
                                >
                                    Edit Character
                                </Button>
                            </Link>
                        )

                        }
                        <Button 
                            isLoading={isSaving} 
                            onClick={handleUpdateChat} 
                            size="lg" color="primary" 
                            variant="solid" 
                            startContent={<Icon filled>save</Icon>}
                        >
                            Save
                        </Button>
                        <SaveDeleteButton 
                            onDelete={handleDelete}
                            isLoading={isDeleting}
                            isDisabled={isSaving}
                        /> 
                    </div>
                </div>
            </SheetContent>
        </Sheet>

        </>
    )
}