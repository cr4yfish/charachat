"use server";

import { createAdminClient, createClient } from "@/utils/supabase/supabase";
import { cache } from "react";
import { getProfile } from "./profiles";
import { Profile } from "@/types/db";
import { loginSchema, signUpSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { encryptMessage } from "@/lib/crypto";
import { removeKeyCookie, setKeyCookie } from "../serverHelpers";

export const checkIsLoggedIn = async () => {
    const { data: { user }, error } = await (await createClient()).auth.getUser();

    if(user == null || error) {
        return false;
    } else if(user.id) {
        return true;
    }

    return false;
}

export const getCurrentUser = cache(async (): Promise<Profile> => {
    const { data: { user } } = await (await createClient()).auth.getUser();

    if(!user) {
        throw new Error("No user found");
    }

    const profile = await getProfile(user.id);

    return profile;
})

export type LoginResponse = {
    validationError: boolean,
    databaseError: string | false,
    success: boolean
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {

    const data = {
        email: email,
        password: password
    }

    // validate the data
    const validateResult = loginSchema.safeParse(data)

    if (!validateResult.success) {
        console.error(validateResult.error)
        
        return {
            validationError: !validateResult.success,
            databaseError: false,
            success: false,
        }
    }

    const { error } = await (await createClient()).auth.signInWithPassword(data)

    if (error) {
        console.error(error)
        return {
            databaseError: error.message,
            validationError: false,
            success: false,
        }
    }

    // set cookie with key
    await setKeyCookie(password, email);

    return {
        success: true,
        databaseError: false,
        validationError: false,
    }
}

type SignUpProps = {
    username: string,
    firstName: string,
    lastName: string,
    avatarLink: string,
    bio: string;
    email: string,
    password: string
}

export const signUp = async (props: SignUpProps): Promise<LoginResponse> => {

    const data = {
        username: props.username,
        firstName: props.firstName,
        lastName: props.lastName,
        avatarLink: props.avatarLink,
        bio: props.bio,
        email: props.email,
        password: props.password
    }

    // validate the data
    const validateResult = signUpSchema.safeParse(data)

    if (!validateResult.success) {
        console.error(validateResult.error)
        
        return {
            validationError: !validateResult.success,
            success: false,
            databaseError: false,
        }
    }

    const { data: { user }, error } = await (await createClient()).auth.signUp(data)

    if (error || !user?.id) {
        console.error(error)
        return {
            validationError: false,
            success: false,
            databaseError: error?.message || "No user id"
        }
    }

    // set cookie with key
    const keyBuffer = await setKeyCookie(data.password, data.email);

    const { error: profilesError } = await (await createClient()).from("profiles").insert({
        user: user.id,
        username: props.username,
        first_name: encryptMessage(props.firstName, keyBuffer),
        last_name: encryptMessage(props.lastName, keyBuffer),
        avatar_link: props.avatarLink,
        bio: encryptMessage(props.bio, keyBuffer),
    })

    if(profilesError) {
        console.error(profilesError)
        return {
            validationError: false,
            success: false,
            databaseError: profilesError.message
        }
    }



    return {
        success: true,
        validationError: false,
        databaseError: false,
    }
}

export const logout = async () => {
    await (await createClient()).auth.signOut();

    await removeKeyCookie();

    revalidatePath("/");
}

export async function deleteAccount() {

    // cross check
    const { data: { user } } = await (await createClient()).auth.getUser();

    if(!user?.id) {
        throw new Error("Delete Account: User not found");
    }

    // delete user
    return await (await createAdminClient()).auth.admin.deleteUser(user.id)
}