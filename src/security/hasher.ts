import * as bcrypt from 'bcrypt';

export class Hasher {
    hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }
}
