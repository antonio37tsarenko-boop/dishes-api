import { App } from './server.js';
import { DishAdder } from './database/dish-adder.js';
import { DatabaseController } from './database/database-controller.js';
import { AuthMiddleware } from './middlewares/auth-middleware';

async function bootstrap() {
    const app = new App(
        new DatabaseController(),
        new DishAdder(),
        new AuthMiddleware(process.env.SECRET),
    );
    await app.init();
    const dishAdder = new DishAdder();
}
await bootstrap();
