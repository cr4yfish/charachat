import crypto from 'crypto';

export const checkIsEncrypted = (message: string): boolean => {
    return message.startsWith("ENC:");
}

export const getKeyClientSide = (): string => {
    const key = sessionStorage.getItem('key');

    if(!key) {
        throw new Error("Key not found in session storage");
    }

    return key;
}

export const generateKey = (password: string, salt: string): Buffer => {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

/**
 * Encrypts a message using the provided key
 * @param message 
 * @param key 
 * @returns string
 * @throws Error if the message is already encrypted
 */
export const encryptMessage = (message: string, key: Buffer): string => {
    if(message.startsWith("ENC:")) {
        throw new Error("Trying to encrypt a message that is already encrypted");
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return "ENC:" + iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypts a message using the provided key
 * @param encryptedMessage 
 * @param key 
 * @returns string
 * @throws Error if the message is not encrypted
 */
export const decryptMessage = (encryptedMessage: string, key: Buffer): string => {
    if(encryptMessage == undefined || !encryptedMessage.startsWith("ENC:")) {
        return encryptedMessage
    }
    const msgWithoutPrefix = encryptedMessage.slice(4);
    const [ivHex, encrypted] = msgWithoutPrefix.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};