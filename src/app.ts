import { UsersController } from './modules/users/users-controller.js';
import { DishesController } from './modules/dishes/dishes-controller.js';
import { DatabaseService } from './modules/database/database-service.js';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware.js';
import express, { type Express } from 'express';
import type { AuthController } from './modules/auth/auth-controller.js';
import type { IsAdminMiddleware } from './middlewares/is-admin-middleware.js';

export class App {
    app: Express;
    usersController: UsersController;
    dishesController: DishesController;
    authController: AuthController;
    databaseService: DatabaseService;
    authMiddleware: AuthMiddleware;
    isAdminMiddleware: IsAdminMiddleware;
    port: string;

    constructor(
        usersController: UsersController,
        dishesController: DishesController,
        databaseService: DatabaseService,
        authMiddleware: AuthMiddleware,
        authController: AuthController,
        isAdminMiddleware: IsAdminMiddleware,
        port: string,
    ) {
        this.app = express();
        this.usersController = usersController;
        this.dishesController = dishesController;
        this.databaseService = databaseService;
        this.authMiddleware = authMiddleware;
        this.authController = authController;
        this.isAdminMiddleware = isAdminMiddleware;
        this.port = port;
    }

    useMiddlewares() {
        this.app.use(express.json());
        this.app.use(this.authMiddleware.execute.bind(this.authMiddleware));
        this.app.use(
            this.isAdminMiddleware.execute.bind(this.isAdminMiddleware),
        );
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
        this.app.listen(Number(this.port));
        console.log(`server is running on port ${this.port}`);
    }
}
