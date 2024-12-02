/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";
import { cache } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";
import { decryptCharacter } from "./character";
import { getKeyServerSide } from "../serverHelpers";
import { LoadMoreProps } from "@/types/client";
import { decryptStory } from "./stories";
import { decryptChat } from "./chat";

const chatMatcher = `
    *
`

const tableName = "chats_characters_last_message";

const chatFormatter = async (db: any): Promise<Chat> => {
    const cookiesStore = cookies();

    const key = cookiesStore.get("key")?.value;

    if(!key) { throw new Error("No key"); }

    const chat = {
        ...db,
        character: {
            id: db.character_id,
            name: db.character_name,
            image_link: db.character_image_link,
        },
        user: {
            user: db.profile_user,
            username: db.profile_username,
            first_name: db.profile_first_name,
            last_name: db.profile_last_name,
            avatar_link: db.profile_avatar_link,
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
            console.error("Error decrypting story", error);
            return decryptedChat;
        }
    }

    return decryptedChat;
}

export const getChats = cache(async (props: LoadMoreProps): Promise<Chat[]> => {
    const { data, error } = await createClient()
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
