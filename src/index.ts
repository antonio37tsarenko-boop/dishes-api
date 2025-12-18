import { App } from './app.js';
import { UsersController } from './modules/users/users-controller.js';
import { UsersService } from './modules/users/users-service.js';
import { AuthService } from './modules/auth/auth-service.js';
import { RedisService } from './modules/redis/redis-service.js';
import { Hasher } from './security/hasher.js';
import { JwtService } from './modules/jwt/jwt-service.js';
import { DishesController } from './modules/dishes/dishes-controller.js';
import { DatabaseService } from './modules/database/database-service.js';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware.js';
import { DishesService } from './modules/dishes/dishes-service.js';
import { AuthController } from './modules/auth/auth-controller.js';
import { MailService } from './modules/mail/mail-service.js';
import { OtpService } from './modules/otp/otp-service.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
    const databaseService = new DatabaseService();
    await databaseService.connectDatabase();
    const usersService = new UsersService(databaseService);
    const usersController = new UsersController(usersService);
    const dishesService = new DishesService(databaseService);
    const dishesController = new DishesController(dishesService);
    const authMiddleware = new AuthMiddleware(process.env.SECRET);
    const redisService = new RedisService();
    const hasher = new Hasher();
    const jwtService = new JwtService();
    const mailService = new MailService();
    const otpService = new OtpService();
    const authService = new AuthService(
        redisService,
        hasher,
        jwtService,
        usersService,
        mailService,
        otpService,
    );
    const authController = new AuthController(authService);

    const app = new App(
        usersController,
        dishesController,
        databaseService,
        authMiddleware,
        authController,
    );
    await app.init();
}

await bootstrap();
