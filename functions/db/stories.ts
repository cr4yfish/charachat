/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase";
import { Story } from "@/types/db";

const storyMatcher = `
    *,
    characters (
        *,
        profiles!characters_owner_fkey (*)
    ),
    profiles!stories_creator_fkey (*)
`

const storyReturnFormat = (db: any): Story => {
    return {
        ...db,
        character: {
            ...db.characters,
            owner: db.characters.profiles
        },
        creator: db.profiles
    }
}

export const getStory = cache(async (storyId: string): Promise<Story> => {
    const { data, error } = await createClient()
        .from("stories")
        .select(storyMatcher)
        .eq("id", storyId)
        .single();

    if (error) {
        throw error;
    }

    return storyReturnFormat(data);
})

export const getCharacterStories = cache(async (characterId: string): Promise<Story[]> => {
    const { data, error } = await createClient()
        .from("stories")
        .select(storyMatcher)
        .eq("character", characterId)

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return storyReturnFormat(db);
    });
})

export const getStories = cache(async (): Promise<Story[]> => {
    const { data, error } = await createClient()
        .from("stories")
        .select(storyMatcher)

    if (error) {
        throw error;
    }

    return data.map((db: any) => {
        return storyReturnFormat(db);
    });
})

type CreateStoryProps = {
    storyId: string;
    userId: string;
    characterId: string;
    title: string;
    description: string;
    story: string;
    image_link: string;
    first_message: string;
}

export const createStory = async (params : CreateStoryProps): Promise<Story> => {
    const { data, error } = await createClient()
    .from("stories")
    .upsert({
        id: params.storyId,
        creator: params.userId,
        character: params.characterId,
        title: params.title,
        description: params.description,
        story: params.story,
        image_link: params.image_link,
        first_message: params.first_message
    })
    .eq("id", params.storyId)
    .select(storyMatcher)
    .single();

    if (error) {
        throw error;
    }

    return storyReturnFormat(data);
}

export const updateStory = async (story: Story): Promise<Story> => {

    const { data, error } = await createClient()
        .from("stories")
        .update({
            title: story.title,
            description: story.description,
            story: story.story,
            image_link: story.image_link
        })
        .eq("id", story.id)
        .single();

    if (error) {
        throw error;
    }

    return storyReturnFormat(data);

}

export const deleteStory = async (storyId: string): Promise<void> => {
    const { error } = await createClient()
        .from("stories")
        .delete()
        .eq("id", storyId);

    if (error) {
        throw error;
    }
}