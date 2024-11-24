/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Message } from "@/types/db";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { getKeyServerSide } from "../serverHelpers";

type getMessagesProps = {
    chatId: string;
    from: number;
    limit: number;
    key: string;
}

export const getMessages = cache(async ({ chatId, from, limit, key } : getMessagesProps): Promise<Message[]> => {
    const { data, error } = await createClient()
        .from("messages")
        .select("*")
        .eq("chat", chatId)
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);

    if (error) {
        throw error;
    }

    const decryptedData = data.map((message: Message) => ({
        ...message,
        content: decryptMessage(message.content, Buffer.from(key, "hex")),
    }));

    return decryptedData;
})

export const getLatestChatMessage = cache(async (chatId: string, key: string): Promise<Message | null> => {    
    const { data, error } = await createClient()
        .from("messages")
        .select("*")
        .eq("chat", chatId)
        .order("created_at", { ascending: false })
        .range(0, 0);

    if (error) {
        throw error;
    }

    const decryptedMessage = data[0] ? {
        ...data[0],
        content: decryptMessage(data[0].content, Buffer.from(key, "hex")),
    } : null;

    return decryptedMessage;
})

export const addMessage = async (message: Message, key: string) => {
    const encryptedContent = encryptMessage(message.content, Buffer.from(key, "hex"));

    const { data, error } = await createClient()
        .from("messages")
        .insert([{
            ...message,
            content: encryptedContent,
            chat: message.chat.id,
            user: message.user.user,
            character: message.character.id,
        }]);

    if (error) {
        throw error;
    }

    return data;
}

export const deleteMessage = async (messageId: string): Promise<void> => {
    const { error } = await createClient()
        .from("messages")
        .delete()
        .eq("id", messageId);

    if (error) {
        throw error;
    }
}

type UpdateMessageProps = {
    content: string;
    id: string;
}

export const updateMessage = async (props: UpdateMessageProps): Promise<void> => {

    const key = await getKeyServerSide();
    const encryptedContent = encryptMessage(props.content, Buffer.from(key, "hex"));

    const { error } = await createClient()
        .from("messages")
        .update({
            content: encryptedContent,
        })
        .eq("id", props.id);

    if (error) {
        throw error;
    }
}