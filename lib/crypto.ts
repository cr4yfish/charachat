import crypto from 'crypto';

export const generateKey = (password: string, salt: string): Buffer => {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

export const encryptMessage = (message: string, key: Buffer): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

export const decryptMessage = (encryptedMessage: string, key: Buffer): string => {
    const [ivHex, encrypted] = encryptedMessage.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};