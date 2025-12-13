import * as crypto from 'node:crypto';

export class Hasher {
    hashPassword(password: string): string {
        const salt = crypto.randomBytes(16).toString('hex');
        const result = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
        return result.toString();
    }
}
