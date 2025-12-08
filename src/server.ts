import express, { type Express } from 'express';
import { DatabaseController } from './database/database-controller.js';
import { AuthMiddleware } from './middlewares/auth-middleware';
import type { DishAdder } from './database/dish-adder';

export class App {
    app: Express;
    port: number;
    databaseController: DatabaseController;
    dishAdder: DishAdder;
    authMiddleware: AuthMiddleware;

    constructor(
        databaseController: DatabaseController,
        dishAdder: DishAdder,
        authMiddleware: AuthMiddleware,
    ) {
        this.app = express();
        this.port = process.env.PORT;
        this.databaseController = databaseController;
        this.authMiddleware = authMiddleware;
        this.dishAdder = dishAdder;
    }

    useAuthMiddleware() {
        this.app.use(this.authMiddleware.execute);
        console.log('Authorization middleware is connected.');
    }

    async init() {
        await this.databaseController.connectDatabase();
        this.app.listen(this.port);
        console.log(`server is running on port ${this.port}`);
    }
}
