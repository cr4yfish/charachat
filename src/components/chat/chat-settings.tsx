"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { TrashIcon } from "lucide-react";
import { fetcher } from "@/lib/utils";
import LLMSelect from "./llm-select";
import { Chat } from "@/types/db";
import { ModelId } from "@/lib/ai/types";
import ButtonGroup from "../ui/button-group";
import { TextareaWithCounter } from "../ui/textarea-with-counter";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { API_ROUTES } from "@/lib/apiRoutes";
import { toast } from "sonner";
import useSWR from "swr";
import equal from "fast-deep-equal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Spinner from "../ui/spinner";

type Props = {
    chatId?: string;
}

const PureSettings = ({ chatId }: Props) => {

    const { data: chat, isLoading, isValidating, mutate } = useSWR(API_ROUTES.GET_CHAT + chatId, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
    });

    const [internalChat, setInternalChat] = useState<Chat | null>(chat);
    const [debouncedChat] = useDebounce(internalChat, 1500);

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const router = useRouter();

    
    // Incoming changes to chat
    useEffect(() => {
        if(!chat) return;
        console.log("Chat updated:", chat);
        setInternalChat(chat);
    }, [chat])


    const handleSaveChanges = useCallback(() => {
        setIsSaving(true);
        const updatePromise = fetch(API_ROUTES.UPDATE_CHAT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(debouncedChat)
        }).finally(() => {
            setIsSaving(false); 
            mutate(debouncedChat, true); // Revalidate the chat data
        });

        toast.promise(updatePromise, {
            loading: "Saving changes...",
            success: "Changes saved successfully!",
            error: "Failed to save changes.",
            position: "bottom-right"
        });

    }, [debouncedChat, mutate]);

    useEffect(() => {
        if(!debouncedChat || equal(debouncedChat, chat)) return;
        console.log("Debounced chat updated:", debouncedChat);
        handleSaveChanges();
    }, [debouncedChat, chat, handleSaveChanges]);

    const handleLLMChange = useCallback((llm: ModelId) => {
        const updatedChat = {
            ...chat,
            llm: llm
        } as Chat
        mutate(updatedChat, false);
    }, [chat, mutate]);

    const handleChatChange = useCallback((updates: Partial<Chat>) => {
        const updatedChat = {
            ...internalChat,
            ...updates
        } as Chat;
        setInternalChat(updatedChat);
    }, [internalChat]);


    return (
        <div className="flex flex-col gap-4 justify-between overflow-auto p-4 pt-0 pb-12">
            
            <span className="text-xs text-muted-foreground">
                {(isLoading || isValidating || isSaving) ? <span className="flex items-center gap-1"><Spinner/> Syncing chat settings</span> : "All changes are saved automatically."}
            </span>

            <LLMSelect 
                selectedKey={chat?.llm as ModelId | undefined}
                onSelect={handleLLMChange} 
                showLink isLoading={isLoading}
            />

            <TextareaWithCounter 
                label="📖 Dynamic Book"
                description="Add context for the AI to reference during conversations."
                placeholder="Add text here..."
                maxLength={10000}
                disabled={isLoading || isValidating}
                value={internalChat?.dynamic_book || ""}
                onChange={(val) => {
                    setInternalChat(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            dynamic_book: val
                        } as Chat;
                    })
                }}
            />

            <TextareaWithCounter
                label="📝 Negative Prompt"
                description="Tell the AI what to avoid generating."
                placeholder="Add text here..."
                maxLength={2000}
                disabled={isLoading || isValidating}
                value={internalChat?.negative_prompt || ""}
                onChange={(val) => {
                    setInternalChat(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            negative_prompt: val
                        } as Chat;
                    })
                }}
            />
            
            <Accordion type="single" collapsible>
                <AccordionItem value="Response">
                    <AccordionTrigger>🎛️ Advanced Response Controls</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 p-1">
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
                            disabled={isLoading || isValidating}
                            value={chat?.response_length?.toString()}
                            onValueChange={(value) => {
                                const updatedChat = {
                                    ...chat,
                                    response_length: parseFloat(value)
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
                            disabled={isLoading || isValidating}
                            value={chat?.temperature?.toString()}
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
                            disabled={isLoading || isValidating}
                            value={chat?.frequency_penalty?.toString()}
                            onValueChange={(value) => {
                                const updatedChat = {
                                    ...chat,
                                    frequency_penalty: parseFloat(value)
                                } as Chat;
                                handleChatChange(updatedChat);
                            }}
                        />                                            
                    </AccordionContent>
                </AccordionItem>

            </Accordion>


            <Button 
                variant={"destructive"} 
                className="rounded-3xl"
                disabled={isLoading || isValidating || !chat?.id  || isDeleting}
                onClick={() => {
                    if (!chat?.id) {
                        toast.error("Chat is not available for deletion.");
                        return;
                    }
                    setIsDeleting(true);
                    
                    const deletePromise = fetch(API_ROUTES.DELETE_CHAT + chat.id, {
                        method: "DELETE"
                    }).then(() => {
                        router.push("/chats");
                    }).catch((err) => {
                        console.error("Error deleting chat:", err);
                    }).finally(() => {
                        setIsDeleting(false);
                    });

                    toast.promise(deletePromise, {
                        loading: "Deleting chat...",
                        success: "Chat deleted successfully!",
                        error: "Failed to delete chat."
                    })
                }}
            >
                <TrashIcon color="currentColor" />
                Delete Chat
            </Button>
        </div>

    )
}

const ChatSettings = memo(PureSettings, (prevProps, nextProps) => {
    // Prevent re-rendering if chatId is the same
    return prevProps.chatId === nextProps.chatId;
});

export default ChatSettings;