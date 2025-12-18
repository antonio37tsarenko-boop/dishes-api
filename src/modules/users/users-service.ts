import mysql, {
    type ResultSetHeader,
    type RowDataPacket,
} from 'mysql2/promise';
import { DatabaseError } from '../../errors/database-error.js';
import type { DatabaseService } from '../database/database-service.js';

interface IHashedPasswordRow extends RowDataPacket {
    hashed_password: string;
}

export class UsersService {
    databaseService: DatabaseService;
    connection: mysql.Connection;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
        this.connection = this.databaseService.connection;
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

    async getHashedPassword(email: string): Promise<IHashedPasswordRow> {
        const [result] = await this.connection.execute<IHashedPasswordRow[]>(
            `
            SELECT hashed_password
            FROM users
            WHERE email = ?
        `,
            [email],
        );
        if (!result[0]) {
            throw new DatabaseError(
                `User with email ${email} doesn\'t exists`,
                404,
            );
        }
        return result[0];
    }

    async deleteUser(email: string): Promise<boolean> {
        const [result] = await this.connection.query<ResultSetHeader>(
            `
            DELETE FROM users
            WHERE email = ?
        `,
            [email],
        );
        return result.affectedRows == 1;
    }
}
