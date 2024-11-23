/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";
import { decryptMessage } from "@/lib/crypto";

const chatMatcher = `
    *
`

const tableName = "chats_overview";

const chatFormatter = (db: any): Chat => {
    const cookiesStore = cookies();

    const key = cookiesStore.get("key")?.value;

    if(!key) {
        throw new Error("No key");
    }

    let decryptedMessage = "";
    
    if(db.last_message && db.last_message.length > 0) {
        decryptedMessage = decryptMessage(db.last_message, Buffer.from(key, "hex"));
    }

    return {
        ...db,
        last_message: decryptedMessage,
        character: {
            id: db.character_id,
            name: db.character_name,
            image: db.character_image,
            image_link: db.character_image_link,
            description: db.character_description,
            avatar_link: db.character_avatar_link,
            avatarUrl: db.character_avatar_url,
            bio: db.character_bio,
            intro: db.character_intro,
            book: db.character_book,
            category: db.character_category,
            is_private: db.character_is_private,
            personality: db.character_personality,
            chats: db.character_chats,
            likes: db.character_likes,
            owner: {
                id: db.character_owner_id,
                username: db.character_owner_username,
            }
        },
        user: {
            id: db.profile_id,
            username: db.profile_username,
            first_name: db.profile_first_name,
            last_name: db.profile_last_name,
            avatar_link: db.profile_avatar_link,
        },
        story: {
            id: db.story_id,
            title: db.story_title,
            description: db.story_description,
            created_at: db.story_created_at,
            owner: db.story_owner,
            likes: db.story_likes,
            chats: db.story_chats,
            image_link: db.story_image_link,
        }
    }
}

export const getChat = cache(async (chatId: string): Promise<Chat> => {
    const { data, error } = await createClient()
        .from(tableName)
        .select(chatMatcher)
        .eq("id", chatId)
        .single();

    if (error) {
        console.error("Error fetching single chat", error);
        throw error;
    }

    return chatFormatter(data);
})

export const getCharacterChats = cache(async (characterId: string): Promise<Chat[]> => {
    const { data, error } = await createClient()
        .from(tableName)
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

export const getChats = cache(async (cursor: number, limit: number): Promise<Chat[]> => {
    const { data, error } = await createClient()
        .from(tableName)
        .select(chatMatcher)
        .order("last_message_at", { ascending: false })
        .range(cursor, cursor + limit)
    
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
    llm?: string;
}

export const createChat = async ({ chatId, userId, characterId, title, description, storyId, llm } : CreateChatProps): Promise<Chat> => {
    const { data, error } = await createClient()
    .from("chats")
    .insert([{
        id: chatId,
        user: userId,
        character: characterId,
        title: title,
        description: description,
        story: storyId,
        llm: llm ?? "",
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
        .from(tableName)
        .update({
            dynamic_book: chat.dynamic_book,
            title: chat.title,
            description: chat.description,
            last_message_at: chat.last_message_at,
            llm: chat.llm
        })
        .eq("id", chat.id)
        .single();

    if (error) {
        console.error("Error updating chat", error);
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