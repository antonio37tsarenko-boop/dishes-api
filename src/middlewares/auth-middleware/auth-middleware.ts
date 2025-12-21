import type { IMiddleware } from '../middleware-interface.js';
import type { Request, Response, NextFunction } from 'express';
import pkg from 'jsonwebtoken';
import type { DatabaseService } from '../../modules/database/database-service.js';
import mysql from 'mysql2/promise';
const { verify } = pkg;

export class AuthMiddleware implements IMiddleware {
    secret: string;

    databaseService: DatabaseService;
    connection: mysql.Connection;
    constructor(secret: string, databaseService: DatabaseService) {
        this.secret = secret;
        this.databaseService = databaseService;
        this.connection = this.databaseService.connection;
    }

    async execute(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!req.user) {
            req.user = {
                email: undefined,
                isAdmin: false,
            };
        }

        if (authHeader) {
            verify(
                authHeader.split(' ')[1] as string,
                this.secret,

                (err, payload) => {
                    if (
                        typeof payload !== 'undefined' &&
                        typeof payload !== 'string'
                    ) {
                        req.user = {
                            email: payload.email,
                            isAdmin: false,
                        };
                    }
                },
            );
        }

        next();
    }
}
