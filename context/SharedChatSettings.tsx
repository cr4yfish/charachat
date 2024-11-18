"use client";

import React from "react";
import { Chat } from "@/types/db";
import { createContext, useContext, useState, ReactNode } from "react";



interface SharedChatContextProps {
    chat: Chat | null;
    setChat: (chat: Chat) => void;
}

const SharedChatContext = createContext<SharedChatContextProps | null>(null);

export const SharedChatProvider = ({ children } : { children: ReactNode }) => {
    const [chat, setChat] = useState<Chat | null>(null);

    return (
        <SharedChatContext.Provider value={{ chat, setChat }}>
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