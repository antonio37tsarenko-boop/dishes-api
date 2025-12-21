import mysql from 'mysql2/promise';

export class DatabaseService {
    connection: mysql.Connection;

    async connectDatabase(
        host: string,
        port: string,
        user: string,
        database: string,
    ) {
        this.connection = mysql.createPool({
            host: host,
            port: Number(port),
            user: user,
            database: database,
        });
        console.log('database is connected');
    }
}
