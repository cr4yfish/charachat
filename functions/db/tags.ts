/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cache } from "react";

import { createClient } from "@/utils/supabase/supabase"
import { Tag } from "@/types/db";
import { getKeyServerSide } from "../serverHelpers";
import { decryptMessage, encryptMessage } from "@/lib/crypto";


const tableName = "tags";

export async function decryptTag(tag: any): Promise<Tag> {
    const key = await getKeyServerSide();
    const keyBuffer = Buffer.from(key, "hex");

    return {
        ...tag,
        name: decryptMessage(tag.name ?? "", keyBuffer),
        description: decryptMessage(tag.description ?? "", keyBuffer)
    }
}

export async function encryptTag(tag: Tag): Promise<Tag> {
    const key = await getKeyServerSide();
    const keyBuffer = Buffer.from(key, "hex");

    return {
        ...tag,
        name: encryptMessage(tag.name ?? "", keyBuffer),
        description: encryptMessage(tag.description ?? "", keyBuffer)
    }
}

export const getTags = cache(async (): Promise<Tag[]> => {
    const { data, error } = await (await createClient()).from(tableName).select("*");
    if (error) {
        console.error(error);
        return [];
    }
    return data;
})

