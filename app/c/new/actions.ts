"use server";

import { redirect } from "next/navigation";
import { v4 as uuidV4 } from "uuid";

import { createClient } from "@/utils/supabase/supabase";

export const saveCharacter = async (formData: FormData): Promise<void> => {

    const { data: { user } } = await createClient().auth.getUser();

    if(!user) {
        throw new Error("Only authenticated users can create characters");
    }

    const character = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        bio: formData.get("bio") as string,
        image_link: formData.get("image_link") as string,
        intro: formData.get("intro") as string,
        book: formData.get("book") as string,
        id: uuidV4(),
        owner: user.id
    }

    const { data, error } = await createClient()
        .from("characters")
        .insert([character])
        .eq("id", character.id)
        .select("*").single();

    if (error) {
        throw error;
    }

    if(data) {
        redirect(`/c/${data.id}`);
    }

}