import { UsersController } from './modules/users/users-controller';
import { DishesController } from './modules/dishes/dishes-controller';
import { DatabaseService } from './modules/database/database-service';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware';
import express, { type Express } from 'express';

export class App {
    app: Express;
    usersController: UsersController;
    dishesController: DishesController;
    databaseService: DatabaseService;
    authMiddleware: AuthMiddleware;

    constructor(
        usersController: UsersController,
        dishesController: DishesController,
        databaseService: DatabaseService,
        authMiddleware: AuthMiddleware,
    ) {
        this.app = express();
        this.usersController = usersController;
        this.dishesController = dishesController;
        this.databaseService = databaseService;
        this.authMiddleware = authMiddleware;
    }
    async setConnection() {
        await this.databaseService.connectDatabase();
        const connection = this.databaseService.connection;
        this.usersController.usersService.connection = connection;
        this.usersController.userAccessService.connection = connection;
        this.dishesController.dishesService.connection = connection;
    }

    useMiddlewares() {
        this.app.use(this.authMiddleware.execute);
    }

    async init() {
        await this.setConnection();
        this.useMiddlewares();
    }
}
