"use server";

import { cookies } from "next/headers";
import SessionStorageManager from "./SessionStorageManager";


export default async function SessionStorageManagerServer() {
    const cookieStore = await cookies();
    const keyCookie = cookieStore.get("key")?.value;

    return (
        <>
        <SessionStorageManager keyCookie={keyCookie} />
        </>
    )
}