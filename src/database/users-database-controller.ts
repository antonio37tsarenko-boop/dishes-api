import mysql from 'mysql2/promise';
import { DatabaseError } from '../errors/database-error.js';

interface IHashedPasswordRow {
    hashed_password: string;
}

export class UsersDatabaseController {
    connection: mysql.Connection;

    async getHashedPassword(email: string): Promise<IHashedPasswordRow> {
        const [result] = await this.connection.query(
            `
            SELECT hashed_password
            FROM users
            WHERE email = ?
        `,
            [email],
        );
        let finalResult = result as IHashedPasswordRow[];
        if (!finalResult.length) {
            throw new DatabaseError(
                `User with email ${email} doesn\'t exists`,
                404,
            );
        }
        return finalResult[0] as IHashedPasswordRow;
    }

    async addUser(
        email: string,
        hashedPassword: string,
        firstName: string,
        lastName: string,
    ) {
        await this.connection.query(
            `
            INSERT INTO users(email, hashed_password, first_name, last_name) 
            VALUES(
                   ?, 
                   ?,
                   ?,
                   ?
                  ) 
        `,
            [email, hashedPassword, firstName, lastName],
        );
    }
}
