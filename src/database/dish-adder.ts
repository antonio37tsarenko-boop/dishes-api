import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseError } from '../errors/database-error.js';

interface IDishId extends RowDataPacket {
    dish_id: number;
}

export class DishAdder {
    connection: mysql.Connection;
    dishID: number;

    private async insertIntoDishes(
        name: string,
        area: string,
        category: string,
        youtubeUrl?: string | null,
    ) {
        if (!youtubeUrl) {
            youtubeUrl = null;
        }

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

            this.connection.query(
                `
        UPDATE ingredients_list
        SET ingredient_? = ?
        WHERE list_id = ?
      `,
                [i, ing, this.dishID],
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
    }

    async addDish(
        name: string,
        area: string,
        category: string,
        ingredients: string[],
        instructionText: string,
        youtubeUrl?: string,
    ) {
        await this.insertIntoDishes(name, area, category, youtubeUrl);
        await this.insertIntoIngredients_list(ingredients);
        await this.insertIntoInstructions(instructionText);
    }
}
