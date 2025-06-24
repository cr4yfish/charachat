/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { cache } from "react";
import { Chat, LoadMoreProps } from "@/types/db";
import { decryptMessageBackwardsCompatible, getKeyServerSide } from "../crypto/server";
import { createServerSupabaseClient as createClient } from "./server";
import { checkIsEncrypted, encryptMessage } from "../crypto/client";
import { decryptCharacter } from "./character";
import { ERROR_MESSAGES } from "../errorMessages";

const chatMatcher = `
    *
`

const tableName = "chats";
const quickView = "chats_quick_view";

const chatFormatter = async (db: any): Promise<Chat> => {
    
    const key = await getKeyServerSide();

    const chat = {
        ...db,
        character: {
            id: db.character_id || db.character,
            name: db.character_name,
            image_link: db.character_image_link,
            category: db.character_category,
            is_private: db.character_is_private || false,
            is_nsfw: db.character_is_nsfw || false,
            is_unlisted: db.character_is_unlisted || false,
        },
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
        } catch {
            console.error(ERROR_MESSAGES.CRYPTO_ERROR);
            return decryptedChat;
        }
    }


    return decryptedChat;
}

export const encryptChat = async(chat: Chat, key: Buffer): Promise<Chat> => {
    try {
        return {
            ...chat,
            last_message: encryptMessage(chat.last_message ?? "", key),
            dynamic_book: encryptMessage(chat.dynamic_book ?? "", key),
            negative_prompt: encryptMessage(chat.negative_prompt ?? "", key),
            title: encryptMessage(chat.title, key),
            description: encryptMessage(chat.description, key)
        }
    } catch (error) {
        console.error(error);
        return chat;
    }
}

export const decryptChat = async(chat: Chat, key: Buffer): Promise<Chat> => {
    try {
        return {
            ...chat,
            last_message: await decryptMessageBackwardsCompatible(chat.last_message ?? "", key),
            dynamic_book: await decryptMessageBackwardsCompatible(chat.dynamic_book ?? "", key),
            negative_prompt: await decryptMessageBackwardsCompatible(chat.negative_prompt ?? "", key),
            title: await decryptMessageBackwardsCompatible(chat.title, key),
            description: await decryptMessageBackwardsCompatible(chat.description, key)
        }
    } catch {
        console.error(ERROR_MESSAGES.CRYPTO_ERROR);
        return chat;
    }
}

export const getChat = cache(async (chatId: string): Promise<Chat | undefined> => {
    const { data, error } = await (await createClient())
        .from(tableName)
        .select(chatMatcher)
        .eq("id", chatId)
        .single();

    if (error) {
        // console.error("Error fetching single chat", error);
        return undefined;
    }

    return await chatFormatter(data);
})

export const getShallowChat = cache(async (chatId: string): Promise<Chat | undefined> => {
    const { data, error } = await (await createClient())
        .from(quickView)
        .select(chatMatcher)
        .eq("id", chatId)
        .single();

    if (error) {
        // console.error("Error fetching single chat", error);
        return undefined;
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
        .from(quickView)
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

export const getLatestChat = cache(async (): Promise<Chat | undefined> => {
    const { data, error } = await (await createClient())
        .from(quickView)
        .select(chatMatcher)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
    if (error) {
        console.error("Error fetching latest chat", error);
        return undefined;
    }
    return await chatFormatter(data);
})


type CreateChatProps = {
    chatId?: string;
    userId?: string;
    characterId?: string;
    title: string;
    description: string;
    storyId?: string;
    llm?: string;
    negative_prompt?: string
    personaId?: string;
}

export const createChat = async ({ chatId, userId, characterId, title, description, storyId, llm, negative_prompt, personaId } : CreateChatProps): Promise<Chat> => {
    const key = await getKeyServerSide();
    
    const { data, error } = await (await createClient())
    .from("chats")
    .insert([{
        id: chatId,
        character: characterId,
        title: encryptMessage(title, key),
        description: encryptMessage(description, key),
        negative_prompt: encryptMessage(negative_prompt ?? "", key),
        story: storyId,
        llm: llm ?? "",
        clerk_user_id: userId,
        response_length: 1,
        persona: personaId,
        
    }])
    .eq("id", chatId)
    .select(chatMatcher)
    .single();

    if (error) {
        console.error("Error creating chat", error);
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

// export const updateDynamicMemory = async (chatId: string, memory: string, replace?: boolean): Promise<string> => {
//     const key = await getKeyServerSide();

//     const dynamic_book = (await getChat(chatId)).dynamic_book;

//     if(dynamic_book) {
//         memory = replace ? memory : `${dynamic_book}. ${memory}`;
//     }

//     const profile = await getCurrentUser();

//     // summarize the new dynamic book
//     const summarizedBook = await summarizeTool({ text: memory, profile });

//     const encryptedMemory = encryptMessage(summarizedBook, Buffer.from(key, "hex"));
    
//     const { error } = await (await createClient())
//         .from("chats")
//         .update({
//             dynamic_book: encryptedMemory
//         })
//         .eq("id", chatId)

//     if (error) {
//         console.error("Error updating chat", error);
//         throw error;
//     }

//     return summarizedBook;
// }

export const deleteChat = async (chatId: string): Promise<void> => {
    const { error } = await (await createClient())
        .from("chats")
        .delete()
        .eq("id", chatId);

    if (error) {
        throw error;
    }
}