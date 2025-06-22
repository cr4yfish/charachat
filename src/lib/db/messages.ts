"use server";

import { cache } from "react";

import { createServerSupabaseClient as createClient } from "./server";
import { Message } from "@/types/db";
import { encryptMessage } from "../crypto/client";
import { decryptMessageBackwardsCompatible, getKeyServerSide } from "../crypto/server";
import { revalidateTag } from "next/cache";

type getMessagesProps = {
    chatId: string;
    from: number;
    limit: number;
    key: Buffer;
}

export const getMessages = cache(async ({ chatId, from, limit, key } : getMessagesProps): Promise<Message[]> => {
    const { data, error } = await (await createClient())
        .from("messages")
        .select("*")
        .eq("chat", chatId)
        .order("created_at", { ascending: false }) // to get newest messages first
        .range(from, from + limit - 1);

    if (error) {
        throw error;
    }

    const decryptedData = await Promise.all(data.map(async (message: Message) => ({
        ...message,
        content: await decryptMessageBackwardsCompatible(message.content, key),
    })));

    // Sort messages by created_at in ascending order
    decryptedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return decryptedData;
})

export const getLatestChatMessage = cache(async (chatId: string, key: Buffer, numMessages = 0): Promise<Message[]> => {    
    const { data, error } = await (await createClient())
        .from("messages")
        .select("*")
        .eq("chat", chatId)
        .order("created_at", { ascending: false })
        .range(0, numMessages);

    if (error) {
        throw error;
    }

    const decryptedMessages = await Promise.all(data.map(async (message: Message) => ({
        ...message,
        content: await decryptMessageBackwardsCompatible(message.content, key),
    })));

    return decryptedMessages;
})

export const addMessage = async (message: Message, key: Buffer): Promise<Message> => {
    const encryptedContent = encryptMessage(message.content, key);

    const { data, error } = await (await createClient())
        .from("messages")
        .insert([{
            ...message,
            content: encryptedContent,
            chat: message.chat.id,
            user: message.user,
            character: message.character?.id,
        }])
        .eq("id", message.id)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    revalidateTag("messages:" + message.chat.id);

    return data;
}


export const addMessages = async (props: { messages: Message[], key: Buffer, userId: string }): Promise<Message> => {
    const encryptedMessages = props.messages.map(msg => ({
        ...msg,
        chat: msg.chat.id,
        character: msg.character?.id,
        content: encryptMessage(msg.content, props.key),
        clerk_user_id: props.userId,
    }));

    const { data, error } = await (await createClient())
        .from("messages")
        .insert(encryptedMessages)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    revalidateTag("messages:" + props.messages[0].chat.id);

    return data;
}

export const deleteMessage = async (messageId: string, chatId: string): Promise<void> => {
    const { error } = await (await createClient())
        .from("messages")
        .delete()
        .eq("id", messageId);

    if (error) {
        throw error;
    }

    revalidateTag("messages:" + chatId);

}

type UpdateMessageProps = {
    content: string;
    id: string;
    chatId: string;
}

export const updateMessage = async (props: UpdateMessageProps): Promise<void> => {
    const key = await getKeyServerSide();
    const encryptedContent = encryptMessage(props.content, key);

    const { error } = await (await createClient())
        .from("messages")
        .update({
            content: encryptedContent,
        })
        .eq("id", props.id);

    if (error) {
        throw error;
    }

    revalidateTag("messages:" + props.chatId);
}