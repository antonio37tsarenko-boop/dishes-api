import type { IMiddleware } from './middleware-interface.js';
import type { Request, Response, NextFunction } from 'express';
import * as pkg from 'jsonwebtoken';
const { verify } = pkg;

export class AuthMiddleware implements IMiddleware {
    secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    execute(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            verify(
                authHeader.split(' ')[1] as string,
                this.secret,
                (err, payload: any) => {
                    if (typeof payload !== 'undefined') {
                        req.user = payload.email;
                        next();
                    }
                },
            );
            next();
        }
    }
}
