"use client";

import { useState } from "react";
import { Avatar } from "@nextui-org/avatar";
import { Slider, SliderValue } from "@nextui-org/slider";
import { Button } from "../utils/Button";
import Icon from "../utils/Icon";
import SaveDeleteButton from "../utils/SaveDeleteButton";
import { deleteChat, updateChat } from "@/functions/db/chat";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useSharedChat } from "@/context/SharedChatSettings";
import Link from "next/link";
import TextareaWithCounter from "../utils/TextareaWithCounter";
import { _CHAT_MAX_LENGTH } from "@/lib/maxLength";
import StoryCard from "../story/StoryCard";
import CharacterCard from "../character/CharacterCard";
import LLMSelect from "../LLMSelect";
import { Profile } from "@/types/db";

type Props = {
    user: Profile
}

export default function ChatSettingsDrawer(props: Props) {

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
            <SheetContent className="flex flex-col gap-4 w-full">
                <SheetHeader className=" w-full items-start">
                    <SheetDescription>Chat with {chat?.character.name}</SheetDescription>
                    <SheetTitle>Chat Settings</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 justify-between h-full max-h-screen overflow-auto">
                    <div className="flex flex-col gap-2">
    
                        <div className="flex flex-col gap-1">
                            <span className="text-sm dark:text-zinc-400">Select the LLM to use</span>
                            <LLMSelect 
                                user={props.user}
                                onSelect={(llm) => chat && setChat({...chat, llm: llm})}
                            />
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
                            <span className="text-sm dark:text-zinc-400">Adjust the AI</span>
                            <Slider 
                                showSteps 
                                step={1} 
                                hideValue
                                className="max-w-[95%] self-center"
                                value={[chat?.response_length ?? 0] as SliderValue}
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

                            <Slider 
                                showSteps 
                                step={.1} 
                                minValue={.6}
                                maxValue={.8} 
                                hideValue
                                className="max-w-[95%] self-center"
                                value={[chat?.temperature] as SliderValue}
                                onChange={(e) => {
                                    if (chat) {
                                        setChat({...chat, temperature: (e as Array<number>)[0]});
                                    }
                                }}
                                label="Randomness"
                                size="lg"
                                marks={[
                                    { value: 0.6, label: "Low" },
                                    { value: 0.7, label: "Medium" },
                                    { value: 0.8, label: "High" }
                                ]}
                            />

                            <Slider 
                                showSteps 
                                step={.1} 
                                minValue={0}
                                maxValue={1} 
                                hideValue
                                className="max-w-[95%] self-center"
                                value={[chat?.frequency_penalty] as SliderValue}
                                onChange={(e) => {
                                    if (chat) {
                                        setChat({...chat, frequency_penalty: (e as Array<number>)[0]});
                                    }
                                }}
                                label="Repetition reduction"
                                size="lg"
                                marks={[
                                    { value: 0, label: "None" },
                                    { value: 0.5, label: "Medium" },
                                    { value: 0.9, label: "Extreme" }
                                ]}
                            />
                        </div>

                        {chat?.character && <CharacterCard data={chat.character} hasLink fullWidth />}
                        {chat?.story && <StoryCard fullWidth data={chat?.story} hasLink />}
                        
                    </div>

                    <div className="flex flex-col gap-2">
                        { (chat?.character.owner.user == chat?.user.user) && (
                            <Link href={`/c/${chat?.character.id}/edit`}>
                                <Button
                                    size="lg" fullWidth variant="flat"
                                    startContent={<Icon filled>open_in_new</Icon>}
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
                            Save Chat Settings
                        </Button>
                        <SaveDeleteButton 
                            onDelete={handleDelete}
                            isLoading={isDeleting}
                            isDisabled={isSaving}
                            label="Delete Chat"
                        /> 
                    </div>
                </div>
            </SheetContent>
        </Sheet>

        </>
    )
}