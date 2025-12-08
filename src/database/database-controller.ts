import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();

export class DatabaseController {
  connection: mysql.Connection;

  async connectDatabase() {
    this.connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      database: process.env.DATABASE_NAME,
    });
    console.log('database is connected');
  }

  async getDishByName(dishName: string) {
    return await this.connection.query(
      `
    SELECT *
    FROM dishes
    WHERE name = ?
  `,
      [dishName],
    );
  }

  async getDishDetailsByName(value: string) {
    return await this.getDishDetails('name', value);
  }

  async getDishDetailsByID(id: string | number) {
    return await this.getDishDetails('dish_id', id.toString());
  }

  private async getDishDetails(type: `name` | `dish_id`, value: string) {
    return await this.connection.query(
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
}
