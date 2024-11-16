"use server";

import { ZodError } from "zod";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/supabase";
import { cache } from "react";
import { getProfile } from "./profiles";
import { Profile } from "@/types/db";

import { loginSchema } from "@/lib/schemas";
import { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { generateKey } from "@/lib/crypto";

export const checkIsLoggedIn = async () => {
    const { data: { user }, error } = await createClient().auth.getUser();

    if(user == null || error) {
        return false;
    } else if(user.id) {
        return true;
    }

    return false;
}

export const getCurrentUser = cache(async (): Promise<Profile> => {
    const { data: { user } } = await createClient().auth.getUser();

    if(!user) {
        throw new Error("No user found");
    }

    const profile = await getProfile(user.id);

    return profile;
})

export const getSession = cache(async () => {
    const { data: session, error } = await createClient().auth.getSession();

    if(error) {
        throw error;
    }

    return session;
})

export type LoginResponse = {
    validationError?: ZodError<{email: string, password: string}>,
    databaseError?: AuthError,
    success?: boolean
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: email,
        password: password
    }

    // validate the data
    const validateResult = loginSchema.safeParse(data)

    if (!validateResult.success) {
        console.error(validateResult.error)
        
        return {
            validationError: validateResult.error
        }
    }

    const { error } = await createClient().auth.signInWithPassword(data)

    if (error) {
        console.error(error)
        return {
            databaseError: error
        }
    }

    // set cookie with key
    const keyBuffer = generateKey(password, email);

    cookies().set("key", keyBuffer.toString("hex"), { secure: true });

    return {
        success: true
    }
}

export const logout = async () => {
    await createClient().auth.signOut();
    revalidatePath("/");
}