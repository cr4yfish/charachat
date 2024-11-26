/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";
import { decryptMessage, encryptMessage } from "@/lib/crypto";
import { decryptCharacter } from "./character";
import { getKeyServerSide } from "../serverHelpers";

const chatMatcher = `
    *
`

const tableName = "chats_overview";

const chatFormatter = async (db: any): Promise<Chat> => {
    const cookiesStore = cookies();

    const key = cookiesStore.get("key")?.value;

    if(!key) {
        throw new Error("No key");
    }

    let decryptedMessage = "";
    
    if(db.last_message && db.last_message.length > 0) {
        decryptedMessage = decryptMessage(db.last_message, Buffer.from(key, "hex"));
    }

    let decryptedDynamicBook = "";

    if(db.dynamic_book && db.dynamic_book !== null && db.dynamic_book.length > 1) {
        decryptedDynamicBook = decryptMessage(db.dynamic_book, Buffer.from(key, "hex"));
    }

    const chat = {
        ...db,
        last_message: decryptedMessage,
        dynamic_book: decryptedDynamicBook,
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
            system_prompt: db.character_system_prompt,
            image_prompt: db.character_image_prompt,
            first_message: db.character_first_message,
            owner: {
                user: db.character_owner,
                username: db.character_owner_username,
                avatar_link: db.character_owner_avatar_link,
            }
        },
        user: {
            user: db.profile_user,
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
        },
        persona: {
            id: db.persona_id,
            full_name: db.persona_full_name,
            bio: db.persona_bio,
            avatar_link: db.persona_avatar_link,
            is_private: db.persona_is_private,
            created_at: db.persona_created_at,
            creator: {
                user: db.persona_creator,
                username: db.persona_creator_username,
                avatar_link: db.persona_creator_avatar_link,
            }
        }
    } as Chat;

    if(chat.character.is_private) {
        try {
            const key = await getKeyServerSide();
            chat.character = await decryptCharacter(chat.character, key);
        } catch (error) {
            console.error("Error decrypting character", error);
            return chat;
        }
 
    }

    return chat;
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

    return Promise.all(data.map(async (db: any) => {
        return await chatFormatter(db)
    }))
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

    return Promise.all(data.map(async (db: any) => {
        return await chatFormatter(db)
    }))
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

    return await chatFormatter(data)
}

export const updateChat = async (chat: Chat): Promise<void> => {
    const { error } = await createClient()
        .from("chats")
        .update({
            dynamic_book: chat.dynamic_book,
            title: chat.title,
            description: chat.description,
            last_message_at: chat.last_message_at ?? chat.created_at,
            llm: chat.llm
        })
        .eq("id", chat.id)

    if (error) {
        console.error("Error updating chat", error);
        throw error;
    }

}

export const updateDynamicMemory = async (chatId: string, memory: string): Promise<void> => {
    const key = await getKeyServerSide();
    const encryptedMemory = encryptMessage(memory, Buffer.from(key, "hex"));
    
    const { error } = await createClient()
        .from("chats")
        .update({
            dynamic_book: encryptedMemory
        })
        .eq("id", chatId)

    if (error) {
        console.error("Error updating chat", error);
        throw error;
    }
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