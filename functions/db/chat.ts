/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";

const chatMatcher = `
    *,
    characters (
        *,
        profiles!characters_owner_fkey (*)
    ),
    stories (
        *,
        characters (
            *,
            profiles!characters_owner_fkey (*)
        )
    ),
    profiles (*)
`

const chatFormatter = (db: any): Chat => {
    return {
        ...db,
        character: db.characters,
        story: db.stories,
        user: db.profiles
    }
}

export const getChat = cache(async (chatId: string): Promise<Chat> => {
    const { data, error } = await createClient()
        .from("chats")
        .select(chatMatcher)
        .eq("id", chatId)
        .single();

    if (error) {
        throw error;
    }

    return chatFormatter(data);
})

export const getCharacterChats = cache(async (characterId: string): Promise<Chat[]> => {
    const { data, error } = await createClient()
        .from("chats")
        .select(chatMatcher)
        .eq("character", characterId)
        .order("last_message_at", { ascending: false })
    
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return chatFormatter(db)
    });
})

export const getChats = cache(async (): Promise<Chat[]> => {
    const { data, error } = await createClient()
        .from("chats")
        .select(chatMatcher)
        .order("last_message_at", { ascending: false })
    
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return chatFormatter(db)
    });
})


type CreateChatProps = {
    chatId: string;
    userId: string;
    characterId: string;
    title: string;
    description: string;
    storyId?: string;
}

export const createChat = async ({ chatId, userId, characterId, title, description, storyId } : CreateChatProps): Promise<Chat> => {
    const { data, error } = await createClient()
    .from("chats")
    .insert([{
        id: chatId,
        user: userId,
        character: characterId,
        title: title,
        description: description,
        story: storyId
    }])
    .eq("id", chatId)
    .select(chatMatcher)
    .single();

    if (error) {
        throw error;
    }

    return chatFormatter(data)
}

export const updateChat = async (chat: Chat): Promise<Chat> => {

    const { data, error } = await createClient()
        .from("chats")
        .update({
            dynamic_book: chat.dynamic_book,
            title: chat.title,
            description: chat.description,
            last_message_at: chat.last_message_at
        })
        .eq("id", chat.id)
        .single();

    if (error) {
        throw error;
    }

    return data

}

export const deleteChat = async (chatId: string): Promise<void> => {
    const { error } = await createClient()
        .from("chats")
        .delete()
        .eq("id", chatId);

    if (error) {
        throw error;
    }
}