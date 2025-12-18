import { UsersController } from './modules/users/users-controller.js';
import { DishesController } from './modules/dishes/dishes-controller.js';
import { DatabaseService } from './modules/database/database-service.js';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware.js';
import express, { type Express } from 'express';
import type { AuthController } from './modules/auth/auth-controller';

export class App {
    app: Express;
    usersController: UsersController;
    dishesController: DishesController;
    authController: AuthController;
    databaseService: DatabaseService;
    authMiddleware: AuthMiddleware;

    constructor(
        usersController: UsersController,
        dishesController: DishesController,
        databaseService: DatabaseService,
        authMiddleware: AuthMiddleware,
        authController: AuthController,
    ) {
        this.app = express();
        this.usersController = usersController;
        this.dishesController = dishesController;
        this.databaseService = databaseService;
        this.authMiddleware = authMiddleware;
        this.authController = authController;
    }

    useMiddlewares() {
        this.app.use(express.json());
        this.app.use(this.authMiddleware.execute.bind(this.authMiddleware));
    }

    bindAllRoutes() {
        this.dishesController.bindDishRoutes();
        this.app.use('/dishes', this.dishesController.router);

        this.authController.bindAuthRoutes();
        this.app.use('/auth', this.authController.router);

        this.usersController.bindUsersRoutes();
        this.app.use('/users', this.usersController.router);
    }

    async init() {
        this.useMiddlewares();
        this.bindAllRoutes();
        this.app.listen(process.env.PORT);
        console.log(`server is running on port ${process.env.PORT}`);
    }
}
