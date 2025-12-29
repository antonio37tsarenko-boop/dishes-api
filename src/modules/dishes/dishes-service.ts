import mysql, { type ResultSetHeader } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2/promise';
import { BadRequestError } from '../../errors/bad-request-error.js';
import type { DatabaseService } from '../database/database-service.js';
import QueryString from 'qs';
import { ServerError } from '../../errors/server-error.js';

interface IDishId extends RowDataPacket {
    dish_id: number;
}

interface IDishInfo extends RowDataPacket {
    dish_id: number;
    name: string;
    area: string;
    category: string;
    youtubeUrl?: string;
}

interface IUserId extends RowDataPacket {
    user_id: number;
}

interface IFilters {
    area?: string;
    category?: string;
    ingredients: string[];
}

export class DishesService {
    databaseService: DatabaseService;
    connection: mysql.Connection;
    dishID: number | undefined;

    constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService;
        this.connection = this.databaseService.connection;
    }

    private async getUserIdByEmail(email: string) {
        const [result] = await this.connection.query<IUserId[]>(
            `
            SELECT user_id
            FROM users
            WHERE email = ?
        `,
            [email],
        );
        if (result[0]) {
            return result[0].user_id;
        } else throw new Error(`User with email ${email} doesn\'t exist.`);
    }

    private async getDishIdByName(dishName: string) {
        const [result] = await this.connection.query<IDishId[]>(
            `
    SELECT dish_id
    FROM dishes
    WHERE name = ?
    `,
            [dishName],
        );
        if (result[0]) {
            return result[0].dish_id;
        } else return false;
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

        const dishID = await this.getDishIdByName(name);

        if (dishID) {
            this.dishID = dishID;
        } else throw new ServerError("Dish isn't added.");
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
        const [rows] = await this.connection.query<IDishInfo[]>(
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

        if (rows[0]) {
            return rows[0];
        }
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

    async addDishInLiked(dishName: string, userEmail: string) {
        const userID = await this.getUserIdByEmail(userEmail);
        const dishID = await this.getDishIdByName(dishName);

        const [result] = await this.connection.query<ResultSetHeader>(
            `
            INSERT INTO liked_dishes
            VALUES (
                    ?,
                    ?
                   )
        `,
            [userID, dishID],
        );
        return result.affectedRows === 1;
    }
}
