import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';

export class DatabaseService {
    connection: mysql.Connection;

    async connectDatabase() {
        this.connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USER,
            database: process.env.DATABASE_NAME,
        });
        console.log('database is connected');
    }
}
