import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseError } from '../../errors/database-error.js';
import { BadRequestError } from '../../errors/bad-request-error.js';
import type { DatabaseService } from '../database/database-service.js';
import QueryString from 'qs';

interface IDishId extends RowDataPacket {
    dish_id: number;
}

export class DishesService {
    databaseService: DatabaseService;
    connection: mysql.Connection;
    dishID: number | undefined;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
        this.connection = this.databaseService.connection;
    }

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

    async addDish(
        name: string,
        area: string,
        category: string,
        youtubeUrl: string,
        ingredients: string[],
        instructionText: string,
    ) {
        await this.insertIntoDishes(name, area, category, youtubeUrl);
        await this.insertIntoIngredients_list(ingredients);
        await this.insertIntoInstructions(instructionText);
    }

    async getDishByName(dishName: string) {
        const [rows] = await this.connection.query(
            `
    SELECT *
    FROM dishes
    WHERE name = ?
  `,
            [dishName],
        );
        console.log(rows);
        return rows;
    }

    async primaryGetDishDetails(type: `name` | `dish_id`, value: string) {
        const [rows] = await this.connection.query(
            `
                SELECT *
                FROM dishes
      
                JOIN ingredients_list
                    ON dish_id = ingredients_list.list_id
      
                JOIN instructions
                    ON dish_id = instructions.instruction_id
    
                WHERE dishes.?? = ?
  `,
            [type, value],
        );
        return rows;
    }

    async getDishDetails(
        name:
            | string
            | QueryString.ParsedQs
            | (string | QueryString.ParsedQs)[]
            | undefined,
        id:
            | string
            | QueryString.ParsedQs
            | (string | QueryString.ParsedQs)[]
            | undefined,
    ) {
        if (name && id) {
            throw new BadRequestError(
                'name and id are transferred in one request when only one of them is required.',
            );
        } else if (typeof name !== 'undefined') {
            return this.primaryGetDishDetails('name', name.toString());
        } else if (typeof id !== 'undefined') {
            return this.primaryGetDishDetails('dish_id', id.toString());
        } else {
            throw new BadRequestError(
                'name and id are not transferred when one of them is required.',
            );
        }
    }
}
