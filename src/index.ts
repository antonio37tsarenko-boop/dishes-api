import { App } from './app';
import { UsersController } from './modules/users/users-controller';
import { UsersService } from './modules/users/users-service';
import { AuthService } from './modules/auth/auth-service';
import { RedisService } from './modules/redis/redis-service';
import { Hasher } from './security/hasher';
import { JwtService } from './modules/jwt/jwt-service';
import { DishesController } from './modules/dishes/dishes-controller';
import { DatabaseService } from './modules/database/database-service';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware';
import { DishesService } from './modules/dishes/dishes-service';

async function bootstrap() {
    const app = new App(
        new UsersController(
            new UsersService(),
            new AuthService(),
            new RedisService(),
            new Hasher(),
            new JwtService(),
        ),
        new DishesController(new DishesService()),
        new DatabaseService(),
        new AuthMiddleware(process.env.SECRET),
    );
    await app.init();
}
