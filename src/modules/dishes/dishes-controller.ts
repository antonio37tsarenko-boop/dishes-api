import { BasicController } from '../../common/basic-controller/basic-controller.js';
import type { DishesService } from './dishes-service.js';
import e, { type Request, type Response, type NextFunction } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body.js';
import { BadRequestError } from '../../errors/bad-request-error.js';

export class DishesController extends BasicController {
    dishesService: DishesService;

    constructor(dishesService: DishesService) {
        super();
        this.dishesService = dishesService;
    }

    bindDishRoutes() {
        this.bindRoutes([
            {
                method: 'get',
                path: '/info',
                function: this.getDishDetails,
            },
            {
                method: 'post',
                path: '/add',
                function: this.addDish,
            },
            {
                method: 'get',
                path: '/find',
                function: this.getDishByName,
            },
            {
                method: 'post',
                path: '/like',
                function: this.addDishInLiked,
            },
        ]);
    }

    async addDish(req: Request, res: Response, next: NextFunction) {
        if (!req.user.isAdmin) {
            res.status(403).send('Only admin can add dishes.');
        }
        const body = req.body;
        checkCorrectnessOfBody(body, [
            'name',
            'area',
            'category',
            'ingredients',
            'instruction',
        ]);
        const { name, area, category, ingredients, instruction, youtubeUrl } =
            body;
        await this.dishesService.addDish(
            name,
            area,
            category,
            youtubeUrl,
            ingredients,
            instruction,
        );
        res.send(`dish ${name} is added successfully.`);
    }

    async getDishByName(req: Request, res: Response, next: NextFunction) {
        const dishName = req.query.name;
        if (typeof dishName == 'undefined') {
            throw new BadRequestError(
                'required parameter name is not transferred.',
            );
        }
        res.send(await this.dishesService.getDishByName(dishName.toString()));
    }

    async getDishDetails(req: Request, res: Response, next: NextFunction) {
        const name = req.query.name;
        const id = req.query.id;

        res.send(await this.dishesService.getDishDetails(name, id));
    }

    async addDishInLiked(req: Request, res: Response, next: NextFunction) {
        const userEmail = req.user.email;
        const dishName = req.query.dishName?.toString();
        if (!dishName) {
            res.status(401).send('Dish name is required.');
            return;
        }
        if (!userEmail) {
            res.status(401).send('User is unauthorized.');
            return;
        }
        if (await this.dishesService.addDishInLiked(dishName, userEmail)) {
            res.status(200).send(
                `Dish ${dishName} added in liked list of user ${userEmail} successfully.`,
            );
        } else
            res.status(500).send(
                'Dish ${dishName} is not added in liked list of user ${userEmail}.',
            );
    }
}
