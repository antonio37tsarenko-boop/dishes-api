interface User {
    email: string | undefined;
    isAdmin: boolean;
}

declare namespace Express {
    export interface Request {
        user: User;
    }
}
