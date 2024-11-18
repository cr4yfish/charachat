"use server";

import { v4 as uuidv4 } from "uuid";

import { getCurrentUser } from "@/functions/db/auth";
import { createChat } from "@/functions/db/chat";
import { redirect } from "next/navigation";
import { Profile } from "@/types/db";


export const startChat = async(formData: FormData) => {

    let profile: Profile | undefined = undefined;

    try {
        profile = await getCurrentUser();
    } catch (e) {
        console.error(e);
        redirect("/");
    }

    const characterId = formData.get("characterId") as string;

    const chat = await createChat({
        chatId: uuidv4(),
        userId: profile.user,
        characterId: characterId,
        title: "New Chat",
        description: "This is a new chat",
        llm: "gpt-4o-mini"
    });

    if(!chat) {
        throw new Error("Failed to create chat");
    }

    redirect(`/chat/${chat.id}`);

}

