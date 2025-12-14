import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseError } from '../../errors/database-error';
import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../../errors/bad-request-error';
import { checkCorrectnessOfBody } from '../../utils/checkCorrectnessOfBody';

interface IDishId extends RowDataPacket {
    dish_id: number;
}

export class DishesService {
    connection: mysql.Connection;
    dishID: number | undefined;

    private async insertIntoDishes(
        name: string,
        area: string,
        category: string,
        youtubeUrl: string | null = null,
    ) {
        await this.connection.query(
            `
    INSERT INTO dishes
    VALUES(
           DEFAULT,
           ?,
           ?,
           ?,
           ?
          )
    `,
            [name, area, category, youtubeUrl],
        );

        const [results] = await this.connection.query<IDishId[]>(
            `
    SELECT dish_id
    FROM dishes
    WHERE name = ?
    `,
            [name],
        );

        if (!results[0]) {
            throw new DatabaseError(
                "Server error: new row wasn't created",
                500,
            );
        }
        this.dishID = results[0].dish_id;
        console.log(results);
    }

    private async insertIntoIngredients_list(ingredients: string[]) {
        let i = 1;
        for (const ing of ingredients) {
            if (i === 1) {
                await this.connection.query(
                    `
        INSERT INTO ingredients_list(ingredient_1)
        VALUES(?)
        `,
                    [ing],
                );
                i += 1;
                continue;
            }

            await this.connection.query(
                `
        UPDATE ingredients_list
        SET ingredient_${i} = ?
        WHERE list_id = ?
      `,
                [ing, this.dishID],
            );
            i += 1;
        }
    }

    private async insertIntoInstructions(instructionText: string) {
        await this.connection.query(
            `
      INSERT INTO instructions(text)
      VALUES (?)
    `,
            [instructionText],
        );
        this.dishID = undefined;
    }

    async addDish(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, [
            'name',
            'area',
            'category',
            'ingredients',
            'instructionText',
            'youtubeUrl',
        ]);
        const {
            name,
            area,
            category,
            ingredients,
            instructionText,
            youtubeUrl,
        } = body;
        await this.insertIntoDishes(name, area, category, youtubeUrl);
        await this.insertIntoIngredients_list(ingredients);
        await this.insertIntoInstructions(instructionText);
    }

    async getDishByName(req: Request, res: Response, next: NextFunction) {
        const dishName = req.query.name;
        if (typeof dishName == 'undefined') {
            throw new BadRequestError(
                'required parameter name is not transferred.',
            );
        }
        return this.connection.query(
            `
    SELECT *
    FROM dishes
    WHERE name = ?
  `,
            [dishName],
        );
    }

    async primaryGetDishDetails(type: `name` | `dish_id`, value: string) {
        return this.connection.query(
            `
    SELECT *
    FROM DISHES
      
        JOIN ingredients_list il
          ON dish_id = il.list_id
      
        JOIN instructions i
          ON dish_id = i.instruction_id
    
    WHERE ? = ?
  `,
            [type, value],
        );
    }

    async getDishDetails(req: Request, res: Response, next: NextFunction) {
        const name = req.query.name;
        const id = req.query.id;
        if (name && id) {
            throw new BadRequestError(
                'name and id are transferred in one request when only one of them is required.',
            );
        } else if (typeof name !== 'undefined') {
            res.json(await this.primaryGetDishDetails('name', name.toString()));
        } else if (typeof id !== 'undefined') {
            res.json(
                await this.primaryGetDishDetails('dish_id', id.toString()),
            );
        } else {
            throw new BadRequestError(
                'name and id are not transferred when one of them is required.',
            );
        }
    }
}
