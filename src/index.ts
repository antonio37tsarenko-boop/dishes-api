import { App } from './server.js';
import { DishAdder } from './temporary/database/dish-adder.js';
import { DatabaseService } from './temporary/database/database-service.js';
import { AuthMiddleware } from './middlewares/auth-middleware/auth-middleware';
import { RedisService } from './modules/redis/redis-service';
import { UserAccessController } from './modules/user-access/user-access-service!!';
import { Hasher } from './security/hasher.js';
import { UsersDatabaseController } from './temporary/database/users-database-controller.js';

async function bootstrap() {
    const app = new App(
        new DatabaseService(),
        new DishAdder(),
        new AuthMiddleware(process.env.SECRET),
        new UserAccessController(),
        new RedisService(),
        new Hasher(),
        new UsersDatabaseController(),
    );
    await app.init();
}
await bootstrap();
