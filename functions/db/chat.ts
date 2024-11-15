/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";


export const getChat = cache(async (chatId: string): Promise<Chat> => {
    const { data, error } = await createClient()
        .from("chats")
        .select(`
            *,
            characters (
                *,
                profiles!characters_owner_fkey1 (*)
            )
        `)
        .eq("id", chatId)
        .single();

    if (error) {
        throw error;
    }

    return {
        ...data,
        character: data.characters
    };
})

export const getChats = cache(async (): Promise<Chat[]> => {
    const { data, error } = await createClient().from("chats").select(`
        *,
        profiles!chats_owner_fkey1 (*),
        profiles!chats_owner_fkey2 (*)
    `);
    
    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return {
            ...db
        }
    });
})


type CreateChatProps = {
    chatId: string;
    userId: string;
    characterId: string;
    title: string;
    description: string;
}

export const createChat = async ({ chatId, userId, characterId, title, description } : CreateChatProps): Promise<Chat> => {
    console.log(chatId, userId, characterId, title, description);
    const { data, error } = await createClient()
    .from("chats")
    .insert([{
        id: chatId,
        user: userId,
        character: characterId,
        title: title,
        description: description
    }])
    .eq("id", chatId)
    .select("*")
    .single();

    if (error) {
        throw error;
    }

    return data;
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

    return data;

}