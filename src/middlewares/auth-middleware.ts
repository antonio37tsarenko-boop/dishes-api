import type { IMiddleware } from './middleware-interface';
import type { Request, Response, NextFunction } from 'express';
import { type JwtPayload, verify } from 'jsonwebtoken';

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
                (err, payload) => {
                    if (err) {
                        next();
                    } else if (payload) {
                        const _payload = payload as JwtPayload;
                        req.user = _payload.email;
                        next();
                    }
                },
            );
        }
        next();
    }
}
