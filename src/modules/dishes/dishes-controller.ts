import { BasicController } from '../../common/basic-controller/basic-controller';
import type { DishesService } from './dishes-service';
import e from 'express';

export class DishesController extends BasicController {
    dishesService: DishesService;

    bindDishRoutes() {
        this.bindRoutes([
            {
                method: 'get',
                path: '/info',
                function: this.dishesService.getDishDetails,
            },
            {
                method: 'post',
                path: '/add',
                function: this.dishesService.addDish,
            },
            {
                method: 'get',
                path: '/',
                function: this.dishesService.getDishByName,
            },
        ]);
    }
}
