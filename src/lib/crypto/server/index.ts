import "server-only";

/**
 * Server specific code for database encryption/decryption
*/

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { _ENC_KEY_COOKIE_NAME } from "..";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { TIMINGS } from "@/lib/timings";

/**
 * Gets the users's key from the cookies using cookies() from the header.
 * Only works server side!
 * @returns key as string
 * @throws Error if called on client or no key found
 */
export async function getKeyServerSide(): Promise<Buffer> {
    // this is supposed to throw an error if called on server
    // if it doesnt, then throw an error since it must've been called on client side
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    try { if(window) throw new Error("getKeyServerSide was called on the client. Only works server side") } catch (e) { /* empty */ }
    
    const cookieStore = await cookies();
    const key = cookieStore.get(_ENC_KEY_COOKIE_NAME)?.value;

    if(key) {
        // if the key is in the cookie, return it
        return Buffer.from(key, "hex");
    }

    // 2 strategies:
    // 1. try to get the key from the user metadata
    // 2. create a new key and save it to the user metadata and cookie
    else if(!key) {
        const user = await currentUser();
        if(!user) { throw new Error("User is not authenticated"); }

        // try to get the key from the user metadata
        const metadata = user.privateMetadata
        if(metadata && metadata[_ENC_KEY_COOKIE_NAME]) {
            // if the key is in the metadata, use it
            const keyFromMetadata = metadata[_ENC_KEY_COOKIE_NAME];
            if(!keyFromMetadata || typeof keyFromMetadata !== "string") { throw new Error("Key not found in user metadata");

            // save the key to the cookie for future use
            } else {
                setKeyCookie(keyFromMetadata, user.emailAddresses[0].emailAddress);
                cookieStore.set(_ENC_KEY_COOKIE_NAME, keyFromMetadata, { secure: true, sameSite: "strict", priority: "high", maxAge: TIMINGS.ONE_YEAR });
                return Buffer.from(keyFromMetadata, "hex");
            }
        }

        // create a new key since it wasn't found in the cookies or user metadata
        const client = await clerkClient();

        const key = crypto.randomBytes(32).toString("hex");

        setKeyCookie(key, user.emailAddresses[0].emailAddress);

        cookieStore.set(_ENC_KEY_COOKIE_NAME, key, { secure: true, sameSite: "strict", priority: "high", maxAge: TIMINGS.ONE_YEAR });

        // update the user metadata with the key
        await client.users.updateUserMetadata(user?.id, {
            privateMetadata: {
                _ENC_KEY_COOKIE_NAME: key
            }
        })

        return Buffer.from(key, "hex");
    }

    throw new Error("Decryption key on server side not found in cookies or user metadata");
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
    (await cookies()).set(_ENC_KEY_COOKIE_NAME, keyBuffer.toString("hex"), { secure: true, sameSite: "strict", priority: "high", maxAge: TIMINGS.ONE_YEAR });
    return keyBuffer;
}

/**
 * Removes the key cookie
 */
export const removeKeyCookie = async () => {
    (await cookies()).set(_ENC_KEY_COOKIE_NAME, "", { secure: true, sameSite: "strict", priority: "high", maxAge: 0 });
}