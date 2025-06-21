/**
 * Encryption Code for Database 
 * 
 * We're using a synced Password-based Derivation function (PBKDF) using sha256 to create a key using the users' password
 * Messages are encrypted using AES-256-cbc (Ciper block chaining)
 * 
 * General strategy: 
 * Encrypt messages and add _ENCRYPTION_MARKER in front to easily check for encryption status
*/

import crypto from "node:crypto";
import { _ENC_KEY_COOKIE_NAME, _ENCRYPTION_MARKER } from "..";

const _ENCRYPTION_STANDARD = "aes-256-cbc";



/**
 * Takes a string and checks if the string is encrypted
 * @param message 
 */
export function checkIsEncrypted(message: string): boolean {
    return message.startsWith(_ENCRYPTION_MARKER);
}

/**
 * Returns the key client side
 * @returns key as string
 * @throws error if key is not found or function is called server side
 */
export function getKeyClientSide(): string {
    if(!window) throw new Error("getKeyClientSide was called on server. Only works client side")

    const key = document.cookie.split(";").map(cookie => cookie.trim()).find(cookie => cookie.startsWith(_ENC_KEY_COOKIE_NAME))?.split("=")[1];
    if(!key) throw new Error("Decryption key on client side not found in cookies");

    return key;
}

/**
 * Encrypts a message using the users' key and AES-256
 * @param message 
 * @param key 
 * @returns encrypted message
 */
export function encryptMessage(message: string, key: Buffer): string {
    if(checkIsEncrypted(message)) {
        console.warn("Trying to encrypt a message that's already encrypted!");
        return message; // If the message is already encrypted, return it as is
    };

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(_ENCRYPTION_STANDARD, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${_ENCRYPTION_MARKER + iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a message using the users' key
 * @param encryptedMessage 
 * @param key 
 * @returns 
 */
export function decryptMessage(encryptedMessage: string, key: Buffer): string {
    if(!checkIsEncrypted(encryptedMessage)) {
        //console.error("Trying to decrypt a message that's not encrypted!");
        return encryptedMessage;
    };

    const msgWithoutPrefix = encryptedMessage.slice(_ENCRYPTION_MARKER.length); // Removes the encryption marker
    const [ivHex, encrypted] = msgWithoutPrefix.split(":"); // Splits the init vector from the encrypted message itself
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(_ENCRYPTION_STANDARD, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}