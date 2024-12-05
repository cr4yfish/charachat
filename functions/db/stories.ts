/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Story } from "@/types/db";
import { checkIsEncrypted, decryptMessage, encryptMessage } from "@/lib/crypto";
import { getKeyServerSide } from "../serverHelpers";
import { decryptCharacter } from "./character";
import { LoadMoreProps } from "@/types/client";

const storyMatcher = `
    *,
    characters (
        *,
        profiles!characters_owner_fkey (*)
    ),
    profiles!stories_creator_fkey (*)
`
const storyTableName = "stories_overview"

const storyReturnFormat = async (db: any): Promise<Story> => {
    const story = {
        ...db,
        character: {
            ...db.characters,
            owner: db.characters.profiles
        },
        creator: db.profiles
    } as Story;

    if(story.is_private && !checkIsEncrypted(story.title)) {
        // private but not encrypted

        await updateStory(story);
        return story;
    }

    try {
        const key = await getKeyServerSide();
        return await decryptStory(story, key);
    } catch (error) {
        console.error("Error decrypting story", error);
        return story;
    }
   
}

export const decryptStory = async (story: Story, key: string): Promise<Story> => {
    const keyBuffer = Buffer.from(key, "hex");

    try {
        return {
            ...story,
            title: decryptMessage(story.title, keyBuffer),
            description: decryptMessage(story.description, keyBuffer),
            story: decryptMessage(story.story, keyBuffer),
            image_link: decryptMessage(story.image_link, keyBuffer),
            first_message: decryptMessage(story.first_message, keyBuffer),
            character: await decryptCharacter(story.character, key),
            extra_characters: story.extra_characters?.map((charId) => decryptMessage(charId, keyBuffer))
        }

    } catch(e) {
        console.error("Error decrypting story", e);
        return story;
    }
}

export const encryptStory = async (story: Story, key: string): Promise<Story> => {
    const keyBuffer = Buffer.from(key, "hex");

    return {
        ...story,
        title: encryptMessage(story.title, keyBuffer),
        description: encryptMessage(story.description, keyBuffer),
        story: encryptMessage(story.story, keyBuffer),
        image_link: encryptMessage(story.image_link, keyBuffer),
        first_message: encryptMessage(story.first_message, keyBuffer),
        extra_characters: story.extra_characters?.map((charId) => encryptMessage(charId, keyBuffer))
    }
}

export const getStory = cache(async (storyId: string): Promise<Story> => {
    const { data, error } = await (await createClient())
        .from(storyTableName)
        .select(storyMatcher)
        .eq("id", storyId)
        .single();

    if (error) {
        console.error("Error fetching single story", error);
        throw error;
    }

    return await storyReturnFormat(data);
})

export const searchStories = cache(async (search: string): Promise<Story[]> => {
    const { data, error } = await (await createClient())
        .from(storyTableName)
        .select(storyMatcher)
        .or(`title.ilike.*${search}*` + "," + `description.ilike.*${search}*`);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async(db: any) => {
        return await storyReturnFormat(db);
    }))
})

export const getCharacterStories = cache(async (characterId: string): Promise<Story[]> => {
    const { data, error } = await (await createClient())
        .from(storyTableName)
        .select(storyMatcher)
        .eq("character", characterId)

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async(db: any) => {
        return await storyReturnFormat(db);
    }))
})

export const getStories = cache(async (props: LoadMoreProps): Promise<Story[]> => {
    const { data, error } = await (await createClient())
        .from(storyTableName)
        .select(storyMatcher)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async(db: any) => {
        return await storyReturnFormat(db);
    }))
})

export const getUserStories = cache(async (props: LoadMoreProps): Promise<Story[]> => {

    const { data: { user } } = await (await createClient()).auth.getUser();

    if(!user?.id) {
        throw new Error("No user session found");
    }

    const { data, error } = await (await createClient())
        .from(storyTableName)
        .select(storyMatcher)
        .eq("creator", user.id)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);

    if (error) {
        throw error;
    }

    return Promise.all(data.map(async(db: any) => {
        return await storyReturnFormat(db);
    }))
})

export const getPublicUserStories = cache(async (props: LoadMoreProps): Promise<Story[]> => {
    
    if(!props.args?.userId) {
        throw new Error("No user id provided");
    }

    const { data, error } = await (await createClient())
        .from(storyTableName)
        .select(storyMatcher)
        .eq("creator", props.args.userId)
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .range(props.cursor, props.cursor + props.limit - 1);
    
    if (error) {
        throw error;
    }

    return Promise.all(data.map(async(db: any) => {
        return await storyReturnFormat(db);
    }))
});

type CreateStoryProps = {
    storyId: string;
    userId: string;
    characterId: string;
    title: string;
    description: string;
    story: string;
    image_link: string;
    first_message: string;
    is_private: boolean;
    extra_characters: string[];
}

export const createStory = async (params : CreateStoryProps): Promise<Story> => {
    const { data, error } = await (await createClient())
    .from("stories")
    .upsert({
        id: params.storyId,
        creator: params.userId,
        character: params.characterId,
        title: params.title,
        description: params.description,
        story: params.story,
        image_link: params.image_link,
        first_message: params.first_message,
        is_private: params.is_private,
        extra_characters: params.extra_characters
    })
    .eq("id", params.storyId)
    .select(storyMatcher)
    .single();

    if (error) {
        throw error;
    }

    return await storyReturnFormat(data);
}

export const updateStory = async (story: Story): Promise<void> => {

    // if story is private and not encrypted, encrypt it before uploading
    if(story.is_private && !checkIsEncrypted(story.title)) {
        const key = await getKeyServerSide();
        story = await encryptStory(story, key);
    }

    const { error } = await (await createClient())
        .from("stories")
        .update({
            title: story.title,
            description: story.description,
            story: story.story,
            image_link: story.image_link,
            is_private: story.is_private,
        })
        .eq("id", story.id)

    if (error) {
        throw error;
    }

}

export const deleteStory = async (storyId: string): Promise<void> => {
    const { error } = await (await createClient())
        .from("stories")
        .delete()
        .eq("id", storyId);

    if (error) {
        throw error;
    }
}