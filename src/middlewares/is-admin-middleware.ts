import type { DatabaseService } from '../modules/database/database-service.js';
import mysql, { type RowDataPacket } from 'mysql2/promise';
import type { IMiddleware } from './middleware-interface.js';
import e from 'express';

interface IIsAdminRow extends RowDataPacket {
    is_admin: boolean;
}

export class IsAdminMiddleware implements IMiddleware {
    databaseService: DatabaseService;
    connection: mysql.Connection;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
        this.connection = this.databaseService.connection;
    }

    async execute(req: e.Request, res: e.Response, next: e.NextFunction) {
        const email = req.user.email;
        if (email) {
            const [result] = await this.connection.query<IIsAdminRow[]>(
                `
                SELECT is_admin
                FROM users
                WHERE email = ?
            `,
                [email],
            );
            if (result[0]) {
                req.user.isAdmin = Boolean(result[0].is_admin);
            } else throw new Error('Incorrect email in jwt.');
        }
        next();
    }
}
