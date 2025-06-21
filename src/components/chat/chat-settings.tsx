"use client";

import { memo, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";
import { cn, fetcher } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import LLMSelect from "./llm-select";
import useSWR from "swr";
import { API_ROUTES } from "@/lib/apiRoutes";
import { Chat } from "@/types/db";
import { ModelId } from "@/lib/ai/types";
import ButtonGroup from "../ui/button-group";
import { useDebounce } from "use-debounce";
import Spinner from "../ui/spinner";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import { BetterSwitch } from "../ui/better-switch";

type Props = {
    characterId?: string | undefined;
    chatId: string | undefined;
}

export const PureChatSettings = (props: Props) => {

    // const { data: character, isLoading } = useSWR<Character>(API_ROUTES.GET_CHARACTER_BY_ID + props.characterId, fetcher);
    const { data: chat, mutate } = useSWR<Chat>(API_ROUTES.GET_CHAT + props.chatId, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
    })
    const [isSyncing, setIsSyncing] = useState(false);
    const [debouncedChat] = useDebounce(chat, 2000);

    useEffect(() => {
        if (debouncedChat) {
            fetch(API_ROUTES.UPDATE_CHAT, {
                method: "POST",
                body: JSON.stringify({
                    chat: debouncedChat
                })
            }).catch((err) => {
                console.error("Error updating chat:", err);
            }).finally(() => {
                mutate(debouncedChat, {
                    revalidate: true
                }).finally(() => {
                    setIsSyncing(false);
                });
            })
        }
    }, [debouncedChat, mutate]);

    const handleLLMChange = (llm: ModelId) => {
        const updatedChat = {
            ...chat,
            llm: llm
        } as Chat

        mutate(updatedChat, {
            revalidate: false,
            optimisticData: updatedChat,
        })

        fetch(API_ROUTES.UPDATE_CHAT, {
            method: "POST",
            body: JSON.stringify({
                chat: updatedChat
            })
        }).catch((err) => {
            console.error("Error updating chat:", err);
        })
    }

    const handleChatChange = (chat: Chat) => {
        setIsSyncing(true);
        mutate(chat, {
            revalidate: false,
            optimisticData: chat,
        });
    }

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant={"liquid"} className={cn("rounded-full w-fit bg-transparent ")} >
                    <SettingsIcon />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-screen pt-0">
                <DrawerHeader>
                    <DrawerTitle className="w-full text-start">Chat Settings</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col gap-4 justify-between overflow-auto p-4 pt-0 pb-12">
                    <span className="text-muted-foreground text-sm">General settings</span>
                    <LLMSelect 
                        selectedKey={chat?.llm as ModelId | undefined}
                        onSelect={handleLLMChange} 
                        showLink
                    />

                    <TextareaWithCounter 
                        label="📖 Dynamic Book"
                        description="Add context for the AI to reference during conversations."
                        placeholder="Add text here..."
                        maxLength={10000}
                        value={chat?.dynamic_book || ""}
                        onChange={(value) => {
                            const updatedChat = {
                                ...chat,
                                dynamic_book: value
                            } as Chat;
                            handleChatChange(updatedChat);
                        }}
                    />

                    <TextareaWithCounter
                        label="📝 Negative Prompt"
                        description="Tell the AI what to avoid generating."
                        placeholder="Add text here..."
                        maxLength={2000}
                        value={chat?.negative_prompt}
                        onChange={(value) => {
                            const updatedChat = {
                                ...chat,
                                negative_prompt: value
                            } as Chat;
                            handleChatChange(updatedChat);
                        }}
                    />
                    
                    <span className="text-muted-foreground text-sm">Adjust the AI</span>

                    <BetterSwitch 
                        label="🔍 Context Awareness"
                        description="Makes the AI more responsive to conversation context."
                        disabled
                        checked
                    />

                    <ButtonGroup 
                        label="📝 Response Length"
                        description="Control how long the AI's responses will be."
                        options={[{
                            value: "1",
                            label: "Chat"
                        }, {
                            value: "2",
                            label: "Story"
                        }, {
                            value: "3",
                            label: "Novel"
                        }]}
                        value={chat?.response_length.toString()}
                        onValueChange={(value) => {
                            const updatedChat = {
                                ...chat,
                                responseLength: value
                            } as Chat;
                            handleChatChange(updatedChat);
                        }}  
                    />

                    <ButtonGroup 
                        label="💡 Creativity"
                        description="Increase this to make the AI more creative and less factual."
                        options={[{
                            value: "0.6",
                            label: "Assistant"
                        }, {
                            value: "0.7",
                            label: "Author"
                        }, {
                            value: "0.8",
                            label: "On Drugs"
                        }]}
                        value={chat?.temperature.toString()}
                        onValueChange={(value) => {
                            const updatedChat = {
                                ...chat,
                                temperature: parseFloat(value)
                            } as Chat;
                            handleChatChange(updatedChat);
                        }}
                    />

                    <ButtonGroup 
                        label="👮 Repetition Police"
                        description="Increase this if the AI tends to repeat itself."
                        options={[{
                            value: "0",
                            label: "Default"
                        }, {
                            value: "0.5",
                            label: "Medium"
                        }, {
                            value: "0.9",
                            label: "Extreme"
                        }]}
                        value={chat?.frequency_penalty.toString()}
                        onValueChange={(value) => {
                            const updatedChat = {
                                ...chat,
                                frequency_penalty: parseFloat(value)
                            } as Chat;
                            handleChatChange(updatedChat);
                        }}
                    />

                    <Button variant={"destructive"} className=" rounded-3xl">
                        <TrashIcon color="currentColor" />
                        Delete Chat
                    </Button>
                </div>

                <DrawerFooter className="fixed bottom-0 left-0 w-full h-fit bg-gradient-to-t from-background via-background/75 to-background/0 pb-2 pt-3 flex justify-end">
                    <span className="text-xs text-muted-foreground">
                        {isSyncing ? <div className="flex items-center gap-1"><Spinner /> <span>Saving changes...</span></div> : "All changes are saved automatically."}
                    </span>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}


export const ChatSettings = memo(PureChatSettings, (prevProps, nextProps) => {
    if (prevProps.characterId !== nextProps.characterId) return false;
    if (prevProps.chatId !== nextProps.chatId) return false;

    return true;
});