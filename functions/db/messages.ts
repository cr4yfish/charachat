/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Message } from "@/types/db";

type getMessagesProps = {
    chatId: string;
    from: number;
    limit: number;
}

export const getMessages = cache(async ({ chatId, from, limit } : getMessagesProps): Promise<Message[]> => {
    const { data, error } = await createClient()
        .from("messages")
        .select("*")
        .eq("chat", chatId)
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);

    if (error) {
        throw error;
    }

    return data;
})

export const addMessage = async (message: Message) => {
    const { data, error } = await createClient()
        .from("messages")
        .insert([{
            ...message,
            chat: message.chat.id,
            user: message.user.user,
            character: message.character.id,
        }]);

    if (error) {
        throw error;
    }

    return data;
}