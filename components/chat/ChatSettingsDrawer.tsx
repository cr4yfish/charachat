"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";

import { Chat } from "@/types/db";
import { Button } from "../utils/Button";
import CharacterCard from "@/components/character/CharacterCard";
import Icon from "../utils/Icon";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
import BlurModal from "../utils/BlurModal";
import { Input } from "@nextui-org/input";


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
            const res = await deleteChat(chat.id)
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
         <Button onClick={() => setIsModalOpen(true)} isIconOnly variant="light" className="justify-start">
            <Avatar src={chat.character.image_link} />
        </Button>

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
                    <CharacterCard fullWidth hasLink={false} character={props.chat.character} />
                    <Input label="Chat Title" value={chat.title} onValueChange={(value) => setChat({...chat, title: value})} />
                    <Input label="Chat Description" value={chat.description} onValueChange={(value) => setChat({...chat, description: value})} />
                    
                    <div className="flex flex-col gap-2">
                        <Button isLoading={isSaving} onClick={handleUpdateChat} size="lg" color="primary" variant="flat" startContent={<Icon filled>save</Icon>}>Save</Button>
                        <SaveDeleteButton 
                            onDelete={handleDelete}
                            isLoading={isDeleting}
                            isDisabled={isSaving}
                        /> 
                    </div>
        
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