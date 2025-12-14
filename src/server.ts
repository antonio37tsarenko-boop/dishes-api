import express, {
    type Express,
    type NextFunction,
    type Request,
    type Response,
} from 'express';
import { DatabaseService } from './temporary/database/database-service.js';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware';
import type { DishAdder } from './temporary/database/dish-adder.js';
import type { UserAccessController } from './modules/user-access/user-access-service!!';
import { createTransport, type Transporter } from 'nodemailer';
import type { RedisService } from './modules/redis/redis-service';
import type { Hasher } from './security/hasher.js';
import type { UsersDatabaseController } from './temporary/database/users-database-controller';

export class App {
    app: Express;
    port: number;
    databaseController: DatabaseService;
    dishAdder: DishAdder; //call with .bind(this.databaseController)
    authMiddleware: AuthMiddleware;
    userAccessController: UserAccessController;
    transport: Transporter<any>;
    redisController: RedisService;
    hasher: Hasher;
    usersDatabaseController: UsersDatabaseController;

    constructor(
        databaseController: DatabaseService,
        dishAdder: DishAdder,
        authMiddleware: AuthMiddleware,
        userAccessController: UserAccessController,
        redisController: RedisService,
        hasher: Hasher,
        usersDatabaseController: UsersDatabaseController,
    ) {
        this.usersDatabaseController = usersDatabaseController;
        this.userAccessController = userAccessController;
        this.app = express();
        this.port = process.env.PORT;
        this.databaseController = databaseController;
        this.authMiddleware = authMiddleware;
        this.dishAdder = dishAdder;
        this.redisController = redisController;
        this.hasher = hasher;
        this.transport = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
        this.userAccessController.transport = this.transport;
        this.userAccessController.redisController = this.redisController;
        this.userAccessController.usersDatabaseController =
            this.usersDatabaseController;
        this.userAccessController.hasher = this.hasher;
    }

    bindUserAccessRoutes() {}

    useAuthMiddleware() {
        this.app.use(this.authMiddleware.execute);
        console.log('Authorization middleware is connected.');
    }

    async init() {
        await this.databaseController.connectDatabase();
        this.usersDatabaseController.connection =
            this.databaseController.connection;
        this.app.post(
            '/test',
            (req: Request, res: Response, next: NextFunction) => {
                this.userAccessController.sendOTP(
                    'antonio37tsarenko@gmail.com',
                    'passwordfortest123',
                    'Anton',
                    'Tsarenko',
                );
                res.send('mail is sent successfully');
            },
        );
        this.app.post(
            '/test2',
            async (req: Request, res: Response, next: NextFunction) => {
                const result = await this.userAccessController.verifyOTP(
                    Number(req.query.otp),
                    'antonio37tsarenko@gmail.com',
                );
                res.send(result);
            },
        );
        this.app.listen(this.port);
        console.log(`server is running on port ${this.port}`);
    }
}
