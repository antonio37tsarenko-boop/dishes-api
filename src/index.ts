import * as dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
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
import { IsAdminMiddleware } from './middlewares/is-admin-middleware.js';

async function bootstrap() {
    const databaseService = new DatabaseService();
    await databaseService.connectDatabase(
        process.env.DATABASE_HOST,
        process.env.DATABASE_PORT,
        process.env.DATABASE_USER,
        process.env.DATABASE_NAME,
    );
    const usersService = new UsersService(databaseService);
    const usersController = new UsersController(usersService);
    const dishesService = new DishesService(databaseService);
    const dishesController = new DishesController(dishesService);
    const authMiddleware = new AuthMiddleware(
        process.env.SECRET,
        databaseService,
    );
    const isAdminMiddleware = new IsAdminMiddleware(databaseService);
    const redisService = new RedisService(process.env.REDIS_PORT);
    const hasher = new Hasher();
    const jwtService = new JwtService();
    const mailService = new MailService(
        process.env.MAIL_USER,
        process.env.MAIL_PASS,
    );
   const otpService = new OtpService();
    const authService = new AuthService(
        redisService,
        hasher,
        jwtService,
        usersService,
        mailService,
        otpService,
        process.env.SECRET,
    );
    const authController = new AuthController(authService);

    const app = new App(
        usersController,
        dishesController,
        databaseService,
        authMiddleware,
        authController,
        isAdminMiddleware,
        process.env.PORT,
    );
    await app.init();
}
try {
    await bootstrap();
} catch (err) {
    console.log(`bootstrap error: ${err}`);
}
