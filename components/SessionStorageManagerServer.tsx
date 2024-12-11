"use server";

import { cookies } from "next/headers";
import SessionStorageManager from "./SessionStorageManager";
import { Profile } from "@/types/db";
import { getCurrentUser } from "@/functions/db/auth";


export default async function SessionStorageManagerServer() {
    const cookieStore = await cookies();
    const keyCookie = cookieStore.get("key")?.value;

    let profile: Profile | undefined = undefined;

    try {
        profile = await getCurrentUser();
    } catch {
        // Do nothing
    }

    return (
        <>
        <SessionStorageManager keyCookie={keyCookie} profile={profile}  />
        </>
    )
}