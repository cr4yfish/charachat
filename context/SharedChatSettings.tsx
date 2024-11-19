"use client";

import React from "react";
import { Chat } from "@/types/db";
import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

import { updateChat } from "@/functions/db/chat";

interface SharedChatContextProps {
    chat: Chat | null;
    setChat: (chat: Chat) => void;
    syncDb: (chat: Chat) => Promise<void>;
}

const SharedChatContext = createContext<SharedChatContextProps | null>(null);

export const SharedChatProvider = ({ children } : { children: ReactNode }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const {toast} = useToast();

    const syncDb = async (chat: Chat) => {
        try {
            console.log("Updating chat:", chat)
            await updateChat(chat);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error updating chat",
                description: "An error occurred while updating the chat",
                variant: "destructive"
            })
        }
    }

    return (
        <SharedChatContext.Provider value={{ chat, setChat, syncDb }}>
            {children}
        </SharedChatContext.Provider>
    );
}

export const useSharedChat = () => {
    const context = useContext(SharedChatContext);
    if (!context) {
        throw new Error("useSharedChat must be used within a SharedChatProvider");
    }

    return context;
}