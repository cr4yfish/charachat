/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";
import { checkIsEncrypted, decryptMessage, encryptMessage } from "@/lib/crypto";
import { decryptCharacter } from "./character";
import { getKeyServerSide } from "../serverHelpers";
import { LoadMoreProps } from "@/types/client";
import { summarizeTool } from "../ai/tools";
import { getCurrentUser } from "./auth";
import { decryptStory } from "./stories";
import { decryptPersona } from "./personas";

const chatMatcher = `
    *
`

const tableName = "chats_overview";

const chatFormatter = async (db: any): Promise<Chat> => {
    
    const key = await getKeyServerSide();

    const chat = {
        ...db,
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
            speaker_link: db.character_speaker_link,
            scenario: db.character_scenario,
            owner: {
                user: db.character_owner,
                username: db.character_owner_username,
                avatar_link: db.character_owner_avatar_link,
            },
            loras: db.character_loras,
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
            extra_characters: db.story_extra_characters,
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

    if(chat.story) {
        chat.story.character = chat.character;
    }

    const decryptedChat = await decryptChat(chat, key);

    if(decryptedChat.character.is_private) {
        try {
            const key = await getKeyServerSide();
            decryptedChat.character = await decryptCharacter(decryptedChat.character, key);
            if(decryptedChat.story?.character) {
                decryptedChat.story.character = await decryptCharacter(decryptedChat.story.character, key)
            }
        } catch (error) {
            console.error("Error decrypting character", error);
            return decryptedChat;
        }
    }

    if(decryptedChat.story?.is_private) {
        try {
            const key = await getKeyServerSide();
            decryptedChat.story = await decryptStory(decryptedChat.story, key);
        } catch (error) {
            console.error("Error decrypting story in chat", error);
            return decryptedChat;
        }
    }

    if(decryptedChat.persona?.is_private) {
        try {
            const key = await getKeyServerSide();
            decryptedChat.persona = await decryptPersona(decryptedChat.persona, key);
        } catch (error) {
            console.error("Error decrypting persona in chat", error);
            return decryptedChat;
        }
    }

    return decryptedChat;
}

export const encryptChat = async(chat: Chat, key: string): Promise<Chat> => {
    try {
        const keyBuffer = Buffer.from(key, "hex");
        return {
            ...chat,
            last_message: encryptMessage(chat.last_message ?? "", keyBuffer),
            dynamic_book: encryptMessage(chat.dynamic_book ?? "", keyBuffer),
            negative_prompt: encryptMessage(chat.negative_prompt ?? "", keyBuffer),
            title: encryptMessage(chat.title, keyBuffer),
            description: encryptMessage(chat.description, keyBuffer)
        }
    } catch (error) {
        console.error(error);
        return chat;
    }
}

export const decryptChat = async(chat: Chat, key: string): Promise<Chat> => {
    try {
        const keyBuffer = Buffer.from(key, "hex");
        return {
            ...chat,
            last_message: decryptMessage(chat.last_message ?? "", keyBuffer),
            dynamic_book: decryptMessage(chat.dynamic_book ?? "", keyBuffer),
            negative_prompt: decryptMessage(chat.negative_prompt ?? "", keyBuffer),
            title: decryptMessage(chat.title, keyBuffer),
            description: decryptMessage(chat.description, keyBuffer)
        }
    } catch (error) {
        console.error("Error decrypting chat:",error);
        return chat;
    }
}

export const getChat = cache(async (chatId: string): Promise<Chat> => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select(chatMatcher)
        .eq("id", chatId)
        .single();

    if (error) {
        console.error("Error fetching single chat", error);
        throw error;
    }

    return await chatFormatter(data);
})

export const getCharacterChats = cache(async (characterId: string): Promise<Chat[]> => {
    const { data, error } = await (await createClient())
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

export const getChats = cache(async (props: LoadMoreProps): Promise<Chat[]> => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select(chatMatcher)
        .order("last_message_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit)
    
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
    negative_prompt?: string
}

export const createChat = async ({ chatId, userId, characterId, title, description, storyId, llm, negative_prompt } : CreateChatProps): Promise<Chat> => {
    const key = await getKeyServerSide();
    const keyBuffer = Buffer.from(key, "hex");

    const { data, error } = await (await createClient())
    .from("chats")
    .insert([{
        id: chatId,
        user: userId,
        character: characterId,
        title: encryptMessage(title, keyBuffer),
        description: encryptMessage(description, keyBuffer),
        negative_prompt: encryptMessage(negative_prompt ?? "", keyBuffer),
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

    if(!checkIsEncrypted(chat.title)) {
        // encrypt chat before uploading
        const key = await getKeyServerSide();
        chat = await encryptChat(chat, key)
    }

    const { error } = await (await createClient())
        .from("chats")
        .update({
            dynamic_book: chat.dynamic_book,
            title: chat.title,
            description: chat.description,
            last_message_at: chat.last_message_at ?? chat.created_at,
            llm: chat.llm,
            negative_prompt: chat.negative_prompt,
            response_length: chat.response_length,
            temperature: chat.temperature,
            frequency_penalty: chat.frequency_penalty,
            persona: chat.persona?.id,
        })
        .eq("id", chat.id)

    if (error) {
        console.error("Error updating chat", error);
        throw error;
    }

}

export const updateDynamicMemory = async (chatId: string, memory: string, replace?: boolean): Promise<string> => {
    const key = await getKeyServerSide();

    const dynamic_book = (await getChat(chatId)).dynamic_book;

    if(dynamic_book) {
        memory = replace ? memory : `${dynamic_book}. ${memory}`;
    }

    const profile = await getCurrentUser();

    // summarize the new dynamic book
    const summarizedBook = await summarizeTool({ text: memory, profile });

    const encryptedMemory = encryptMessage(summarizedBook, Buffer.from(key, "hex"));
    
    const { error } = await (await createClient())
        .from("chats")
        .update({
            dynamic_book: encryptedMemory
        })
        .eq("id", chatId)

    if (error) {
        console.error("Error updating chat", error);
        throw error;
    }

    return summarizedBook;
}

export const deleteChat = async (chatId: string): Promise<void> => {
    const { error } = await (await createClient())
        .from("chats")
        .delete()
        .eq("id", chatId);

    if (error) {
        throw error;
    }
}