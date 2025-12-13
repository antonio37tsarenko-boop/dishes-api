import { App } from './server.js';
import { DishAdder } from './database/dish-adder.js';
import { DatabaseService } from './database/database-service.js';
import { AuthMiddleware } from './middlewares/auth-middleware.js';
import { RedisController } from './redis/redis-controller.js';
import { UserAccessController } from './user-access/user-access-controller.js';
import { Hasher } from './security/hasher.js';
import { UsersDatabaseController } from './database/users-database-controller.js';

async function bootstrap() {
    const app = new App(
        new DatabaseService(),
        new DishAdder(),
        new AuthMiddleware(process.env.SECRET),
        new UserAccessController(),
        new RedisController(),
        new Hasher(),
        new UsersDatabaseController(),
    );
    await app.init();
}
await bootstrap();
