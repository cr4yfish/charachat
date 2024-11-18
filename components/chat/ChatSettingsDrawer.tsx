"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";

import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
import BlurModal from "../utils/BlurModal";
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
  

type Props = {
    chat: Chat
}

export default function ChatSettingsDrawer(props: Props) {

    const [chat, setChat] = useState<Chat>(props.chat)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isDeleting, setIsDeleting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleDelete = async () => {
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
                    <Avatar src={chat.character.image_link} />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-4">
                <SheetHeader className=" w-full items-start">
                    <SheetDescription>Chat with {chat.character.name}</SheetDescription>
                    <SheetTitle>Chat Settings</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col justify-between h-full">
                    <div className="flex flex-col gap-2">
                        <Input label="Chat Title" value={chat.title} onValueChange={(value) => setChat({...chat, title: value})} />
                        <Input label="Chat Description" value={chat.description} onValueChange={(value) => setChat({...chat, description: value})} />
                        <Select 
                            onValueChange={(value) => setChat({...chat, llm: value})}
                            defaultValue={chat.llm}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {LLMs.map((llm) => (
                                    <SelectItem key={llm.key} value={llm.key}>{llm.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                    </div>

                    <div className="flex flex-col gap-2">
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


        <BlurModal 
            isOpen={isModalOpen}
            updateOpen={setIsModalOpen}
            settings={{
                size: "full"
            }}
            header={<>Chat Settings</>}
            body={
                <>
                <div className="flex flex-col gap-2">
 
        
                </div>
                </>
            }
            footer={
                <>

                </>
            }
        />
        </>
    )
}