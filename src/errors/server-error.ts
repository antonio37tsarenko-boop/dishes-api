export class ServerError extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.name = 'ServerError';
        this.status = 500;
    }
}
