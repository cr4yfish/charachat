/**
 * Encryption Code for Database 
 * 
 * Messages are encrypted using AES-256-gcm
 * Encryption keys are generated using crypto.randomBytes(32)
 * Keys are stored in the user's metadata on Clerk
 * 
 * General strategy: 
 * Encrypt messages and add _ENCRYPTION_MARKER in front to easily check for encryption status
*/

import crypto from "node:crypto";
import { _ENCRYPTION_MARKER } from "..";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
const _ENCRYPTION_STANDARD = "aes-256-gcm";

/**
 * Takes a string and checks if the string is encrypted
 * @param message 
 */
export function checkIsEncrypted(message: string): boolean {
    return message.startsWith(_ENCRYPTION_MARKER);
}

/**
 * Encrypts a message using the users' key and AES-256
 * @param message 
 * @param key 
 * @returns encrypted message
 */
export function encryptMessage(message: string, key: Buffer): string {
    if(checkIsEncrypted(message) || !message) {
        console.warn(ERROR_MESSAGES.CRYPTO_ERROR)
        return message; // If the message is already encrypted, return it as is
    };

    if(!key || !Buffer.isBuffer(key) || key.length !== 32) {
        throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(_ENCRYPTION_STANDARD, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${_ENCRYPTION_MARKER + iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a message using the users' key
 * @param encryptedMessage 
 * @param key 
 * @returns 
 */
export function decryptMessage(encryptedMessage: string, key: Buffer): string {
    if(!checkIsEncrypted(encryptedMessage)) {
        return encryptedMessage;
    };

    try {
        const msgWithoutPrefix = encryptedMessage.slice(_ENCRYPTION_MARKER.length); // Removes the encryption marker
        const [ivHex, authTagHex, encrypted] = msgWithoutPrefix.split(":"); // Splits the init vector from the encrypted message itself

        if(!ivHex || !authTagHex || !encrypted) {
            throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
        }

        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");

        const decipher = crypto.createDecipheriv(_ENCRYPTION_STANDARD, key, iv);
        decipher.setAuthTag(authTag); // Sets the authentication tag for verification

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8"); // Throws an error if the authentication tag does not match

        return decrypted;
    } catch {
        throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
    }
}

/**
 * Older method for decrypting messages using AES-256-CBC and no authentication tag.
 * This is used for backwards compatibility with older messages that were encrypted without an authentication tag.
 * @param encryptedMessage 
 * @param key 
 * @returns 
 */
export function decryptMessageCBC(encryptedMessage: string, key: Buffer): string {
    if(!checkIsEncrypted(encryptedMessage)) {
        return encryptedMessage;
    };

    try {
        const msgWithoutPrefix = encryptedMessage.slice(_ENCRYPTION_MARKER.length); // Removes the encryption marker
        const [ivHex, encrypted] = msgWithoutPrefix.split(":"); // Splits the init vector from the encrypted message itself
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv(_ENCRYPTION_STANDARD, key, iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch {
        throw new Error(ERROR_MESSAGES.CRYPTO_ERROR);
    }
}