export class DatabaseError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'DatabaseError';
        this.status = status;
    }
}
