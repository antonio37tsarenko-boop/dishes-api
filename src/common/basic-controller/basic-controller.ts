import { Router } from 'express';
import type { IRoute } from './route-interface';

export class BasicController {
    router: Router;

    constructor() {
        this.router = Router();
    }
    bindRoutes(routes: IRoute[]): void {
        for (const route of routes) {
            this.router[route.method](route.path, route.function.bind(this));
            console.log(
                `path ${route.path} is connected with method ${route.method.toUpperCase()}`,
            );
        }
    }
}
