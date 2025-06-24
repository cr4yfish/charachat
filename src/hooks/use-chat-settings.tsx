"use client";

/**
 * Chat Settings Hook with automatic fetching via useSWR
 * 
 * Usage examples:
 * 
 * // With automatic fetching:
 * <ChatSettingsProvider chatId="123">
 *   <YourComponent />
 * </ChatSettingsProvider>
 * 
 * // Without automatic fetching (manual control):
 * <ChatSettingsProvider>
 *   <YourComponent />
 * </ChatSettingsProvider>
 * 
 * // In your component:
 * const { chat, updateChatSettings, isLoading, isFetching } = useChatSettings();
 */

import React from "react";
import { Chat } from "@/types/db";
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { API_ROUTES } from "@/lib/apiRoutes";

/**
 * Context interface for chat settings management
 */
interface ChatSettingsContextProps {
    /** Current chat instance */
    chat: Chat | null;
    /** Function to update the chat state manually */
    setChat: React.Dispatch<React.SetStateAction<Chat | null>>;
    /** Sync chat data with the database */
    syncDb: (chat: Chat) => Promise<void>;
    /** Update specific chat settings and sync with database */
    updateChatSettings: (updates: Partial<Pick<Chat, 'title' | 'description' | 'llm' | 'temperature' | 'response_length' | 'frequency_penalty' | 'negative_prompt'>>) => Promise<void>;
    /** Loading state for database operations */
    isLoading: boolean;    /** Loading state for fetching chat data */
    isFetching: boolean;
    /** Error state for fetching chat data */
    error: Error | null;
    /** Clear the current chat */
    clearChat: () => void;
    /** Manually trigger a refetch of the chat data */
    refetch: () => void;
    /** Initialize chat with external data (useful when chat comes from props) */
    initializeChat: (chatData: Chat) => void;
}

const ChatSettingsContext = createContext<ChatSettingsContextProps | null>(null);

/**
 * Provider component for chat settings context
 * Manages chat state and provides methods to sync with database
 * 
 * @param children - React children components
 * @param chatId - Optional chat ID for automatic fetching. When provided, the chat will be automatically fetched and kept in sync
 * 
 * Features:
 * - Automatic chat fetching when chatId is provided
 * - Optimistic updates with automatic rollback on error
 * - Loading states for both fetching and syncing operations
 * - Manual refetch capability
 * - Chat initialization from external data
 */
export const ChatSettingsProvider = ({ children, chatId } : { children: ReactNode; chatId?: string }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-fetch chat data when chatId is provided
    const { data: fetchedChat, error, isLoading: isFetching, mutate } = useSWR<Chat>(
        chatId ? API_ROUTES.GET_CHAT + chatId : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateIfStale: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        }
    );

    // Sync fetched chat with local state
    useEffect(() => {
        if (fetchedChat && fetchedChat.id !== chat?.id) {
            setChat(fetchedChat);
        }
    }, [fetchedChat, chat?.id]);

    const syncDb = useCallback(async (chat: Chat) => {
        if (!chat?.id) {
            toast.error("Invalid chat data");
            return;
        }

        setIsLoading(true);
        try {
            const updatePromise = fetch(API_ROUTES.UPDATE_CHAT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(chat),
            })
            toast.promise(updatePromise, {
                loading: "Syncing chat...",
                success: "Chat synced successfully",
                error: "Failed to sync chat",
            })
        } catch (error) {
            console.error("Failed to sync chat:", error);
            throw error; // Re-throw to allow caller to handle
        } finally {
            setIsLoading(false);
        }
    }, []);    
        
    const updateChatSettings = useCallback(async (updates: Partial<Pick<Chat, 'title' | 'description' | 'llm' | 'temperature' | 'response_length' | 'frequency_penalty' | 'negative_prompt'>>) => {
        if (!chat) {
            toast.error("No chat loaded");
            return;
        }

        const updatedChat = { ...chat, ...updates };
        
        // Optimistic update - update both local state and SWR cache
        setChat(updatedChat);
        if (chatId) {
            mutate(updatedChat, false); // Update cache without revalidation
        }
        
        try {
            await syncDb(updatedChat);
            // Revalidate the cache after successful sync
            if (chatId) {
                mutate();
            }
        } catch (error) {
            // Revert both local state and SWR cache on error
            setChat(chat);
            if (chatId) {
                mutate(chat, false);
            }
            throw error;
        }
    }, [chat, syncDb, chatId, mutate]);
    
    const clearChat = useCallback(() => {
        setChat(null);
    }, []);    const refetch = useCallback(() => {
        mutate();
    }, [mutate]);

    const initializeChat = useCallback((chatData: Chat) => {
        setChat(chatData);
        // Also update SWR cache if chatId matches
        if (chatId && chatData.id === chatId) {
            mutate(chatData, false);
        }
    }, [chatId, mutate]);

    return (
        <ChatSettingsContext.Provider value={{ 
            chat, 
            setChat, 
            syncDb, 
            updateChatSettings, 
            isLoading,
            isFetching,
            error,
            clearChat,
            refetch,
            initializeChat
        }}>
            {children}
        </ChatSettingsContext.Provider>
    );
}

/**
 * Hook to access chat settings context
 * @returns Chat settings context with state and methods
 * @throws Error if used outside of ChatSettingsProvider
 */
export const useChatSettings = () => {
    const context = useContext(ChatSettingsContext);
    if (!context) {
        throw new Error("useChatSettings must be used within a ChatSettingsProvider");
    }

    return context;
}