import mysql, {
    type ResultSetHeader,
    type RowDataPacket,
} from 'mysql2/promise';
import { DatabaseError } from '../../errors/database-error';
import type { Request, Response, NextFunction } from 'express';

interface IHashedPasswordRow extends RowDataPacket {
    hashed_password: string;
}

export class UsersService {
    connection: mysql.Connection;

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

    async deleteUser(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<boolean> {
        const email = req.user.email;
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
