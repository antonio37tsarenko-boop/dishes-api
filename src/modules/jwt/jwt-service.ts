import jwt from 'jsonwebtoken';

export class JwtService {
    signJWT(email: string, secret: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.sign(
                {
                    email,
                    iot: Math.floor(Date.now() / 1000),
                },
                secret,
                {
                    algorithm: 'HS256',
                },
                (error, jwt) => {
                    if (error) {
                        reject(error);
                    } else if (jwt) {
                        resolve(jwt);
                    }
                },
            );
        });
    }
}
