/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/supabase";
import { Chat } from "@/types/db";
import { LoadMoreProps } from "@/types/client";
import { decryptChat } from "./chat";
import { decryptMessage } from "@/lib/crypto";
import { getKeyServerSide } from "../serverHelpers";

const chatMatcher = `*`
const tableName = "chats_characters_last_message";

const chatFormatter = async (db: any): Promise<Chat> => {

    const key = await getKeyServerSide();
    const keyBuffer = Buffer.from(key, "hex");

    const chat = {
        ...db,
        character: {
            id: db.character_id,
            name: db.character_name,
            image_link: db.character_image_link,
            is_private: db.character_is_private
        }
    } as Chat;

    const decryptedChat = await decryptChat(chat, key);

    if(decryptedChat.character.is_private) {
        decryptedChat.character.name = decryptMessage(decryptedChat.character.name, keyBuffer);
        decryptedChat.character.image_link = decryptMessage(decryptedChat.character.image_link ?? "", keyBuffer);
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
