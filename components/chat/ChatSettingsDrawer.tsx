"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Slider } from "@nextui-org/slider";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
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
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { _CHAT_MAX_LENGTH } from "@/lib/maxLength";


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
                <div className="flex flex-col gap-4 justify-between h-full max-h-screen overflow-auto">
                    <div className="flex flex-col gap-2">
    
                        <div className="flex flex-col gap-1">
                            <span className="text-sm dark:text-zinc-400">Select the LLM to use</span>
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

                        <TextareaWithCounter 
                            label="Chat Title" 
                            description="The title of the chat"
                            maxRows={1}
                            maxLength={_CHAT_MAX_LENGTH.title}
                            value={chat?.title} 
                            onValueChange={(value) => chat && setChat({...chat, title: value})} 
                        />
                        <TextareaWithCounter 
                            label="Chat Description"
                            description="A short description of the chat"
                            maxRows={5}
                            maxLength={_CHAT_MAX_LENGTH.description}
                            value={chat?.description} 
                            onValueChange={(value) => chat && setChat({...chat, description: value})}
                        />
                        <TextareaWithCounter 
                            label="Chat Memory"
                            description="Important information the Character remembered"
                            maxLength={_CHAT_MAX_LENGTH.dynamic_book}
                            value={chat?.dynamic_book}
                            onValueChange={(value) => chat && setChat({...chat, dynamic_book: value})}
                        />
                        <TextareaWithCounter 
                            label="Negative Prompt"
                            description="What the AI shouldn't say. Treat like a soft-banned words list. The AI will try to avoid saying anything you describe here."
                            maxLength={_CHAT_MAX_LENGTH.negative_prompt}
                            value={chat?.negative_prompt}
                            onValueChange={(value) => chat && setChat({...chat, negative_prompt: value})}
                        />

                        <div className="flex flex-col gap-2 w-full relative max-w-full">
                            <span className="text-sm dark:text-zinc-400">Change average response length</span>
                            <Slider 
                                showSteps 
                                step={1} 
                                hideValue
                                className="max-w-[95%] self-center"
                                value={[chat?.response_length ?? 0]}
                                onChange={(e) => {
                                    if (chat) {
                                        setChat({...chat, response_length: (e as Array<number>)[0]});
                                    }
                                }}
                                label="Response length"
                                minValue={1}
                                size="lg"
                                maxValue={3} 
                                marks={[
                                    { value: 1, label: "Short" },
                                    { value: 2, label: "Long" },
                                    { value: 3, label: "Novel" }
                                ]}
                            />
                        </div>

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