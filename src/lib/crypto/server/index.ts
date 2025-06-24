import "server-only";

/**
 * Server specific code for database encryption/decryption
*/

import crypto from "node:crypto";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getKeyServerSideLegacy } from "./legacy";
import { decryptMessageLegacy } from "../client/legacy";
import { decryptMessage } from "../client";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";

/**
 * Gets the users's key from the cookies using cookies() from the header.
 * Only works server side!
 * @returns key as string
 * @throws Error if called on client or no key found
 */
export async function getKeyServerSide(): Promise<Buffer> {
    const user = await currentUser();
    if(!user) { throw new Error(ERROR_MESSAGES.CRYPTO_ERROR); }

    // try to get the key from the user metadata
    const metadata = user.privateMetadata
    if(metadata && metadata.encryption_key) {
        // if the key is in the metadata, use it
        const keyFromMetadata = metadata.encryption_key;

        if(!keyFromMetadata || typeof keyFromMetadata !== "string" || keyFromMetadata.length !== 64) {
            throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
        }

        return Buffer.from(keyFromMetadata, "hex");
    }

    // Generate a new key
    // This will set it in the user metadata
    const key = await generateAndSetKey(user.id);

    // key will be undefined if there was an error generating it
    if(!key) {
        throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
    }

    return key;
}

/**
 *  Generates a new key for the user and sets it in the user metadata.
 * @param userId 
 * @returns key as Buffer or undefined if there was an error
 */
async function generateAndSetKey(userId: string): Promise<Buffer | undefined> {
    try {
        // create a new key since it wasn't found in the cookies or user metadata
        const client = await clerkClient();
        const key = crypto.randomBytes(32).toString("hex");

        // update the user metadata with the key
        await client.users.updateUserMetadata(userId, {
            privateMetadata: {
                encryption_key: key,
                key_generated_at: new Date().toISOString() // Store the key generation time
            }
        })
        return Buffer.from(key, "hex");
    }
    catch {
        return undefined; // Return undefined if there was an error
    }
}


/**
 * This is needed for the transition period where some users might still have encrypted messages using the legacy encryption method.
 * It tries to decrypt the message using the current method first, and if that fails, it
 *  tries to decrypt it using the legacy method.
 * 
 * The legacy method is generally less secure since it generates a key based on the user's password and email, which is not recommended for new implementations.
 * The usual method was also to store the key in the cookies.
 * @param encryptedMessage 
 * @param key 
 * @returns 
 */
export async function decryptMessageBackwardsCompatible(encryptedMessage: string, key: Buffer): Promise<string> {
    // if the message is not encrypted, return it as is
    if(!encryptedMessage || !encryptedMessage.startsWith("ENC:")) {
        return encryptedMessage;
    }

    try {
        // Decrypt using the best available method
        // This will use aes-256-gcm with auth tags
        return decryptMessage(encryptedMessage, key);
    } 
    
    catch {
        // try with legacy decryption
        // this tries to retrieve the legacy key from the cookies
        const legacyKey = await getKeyServerSideLegacy();
        if(!legacyKey) {
            throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
        }

        const legacyDecrypted = decryptMessageLegacy(encryptedMessage, Buffer.from(legacyKey, "hex"));

        return legacyDecrypted;
    }
}