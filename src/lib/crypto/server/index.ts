import "server-only";

/**
 * Server specific code for database encryption/decryption
*/

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { _ENC_KEY_COOKIE_NAME } from "..";
import { redirect } from "next/navigation";

/**
 * Gets the users's key from the cookies using cookies() from the header.
 * Only works server side!
 * @returns key as string
 * @throws Error if called on client or no key found
 */
export async function getKeyServerSide(): Promise<Buffer> {
    // this is supposed to throw an error if called on server
    // if it doesnt, then throw an error since it must've been called on client side
    try { if(window) throw new Error("getKeyServerSide was called on the client. Only works server side") } catch (e) { console.error(e); }
    
    const cookieStore = await cookies();
    const key = cookieStore.get(_ENC_KEY_COOKIE_NAME)?.value;
    if(!key) redirect("/logout"); // we need the user to log back in to get the password to generate a new key
    return Buffer.from(key, "hex");
}

/**
 * Generate a key using the users' password
 * @param password 
 * @param salt 
 * @returns key Buffer
 */
export function generateKey(password: string, salt: string): Buffer {
    return crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256")
}

/**
 * Sets the key cookie. We use the email for salt
 * @param password 
 * @param email 
 * @returns 
 */
export const setKeyCookie = async (password: string, email: string) => {
    const keyBuffer = generateKey(password, email);
    (await cookies()).set(_ENC_KEY_COOKIE_NAME, keyBuffer.toString("hex"), { secure: true, sameSite: "strict", priority: "high", maxAge: 60 * 60 * 24 * 365 });
    return keyBuffer;
}

/**
 * Removes the key cookie
 */
export const removeKeyCookie = async () => {
    (await cookies()).set(_ENC_KEY_COOKIE_NAME, "", { secure: true, sameSite: "strict", priority: "high", maxAge: 0 });
}