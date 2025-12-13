import { type Transporter } from 'nodemailer';
import * as crypto from 'node:crypto';
import type { UsersDatabaseController } from '../database/users-database-controller.js';
import type { Hasher } from '../security/hasher.js';
import type { RedisController } from '../redis/redis-controller.js';

export class UserAccessController {
    transport: Transporter<any>;

    redisController: RedisController;
    usersDatabaseController: UsersDatabaseController;
    hasher: Hasher;

    async verifyOTP(OTP: number, email: string) {
        const data = await this.redisController.getAllHash(`verify:${email}`);
        console.log(data, 'this is data from verify', Number(data.OTP), OTP);
        if (
            typeof data.hashedPassword == 'string' &&
            typeof data.firstName == 'string' &&
            typeof data.lastName == 'string' &&
            Number(data.OTP) === OTP
        ) {
            await this.usersDatabaseController.addUser(
                email,
                data.hashedPassword,
                data.firstName,
                data.lastName,
            );
            await this.redisController.deleteKey(`verify:${email}`);
            return true;
        } else return false;
    }

    async sendOTP(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ) {
        const OTP = this.generateOTP();
        const hashedPassword = this.hasher.hashPassword(password);
        await this.sendOTPMail(OTP, email, 'Your OTP');
        const redisInfo = await this.redisController.saveUserData(
            email,
            hashedPassword,
            firstName,
            lastName,
            Number(OTP),
        );
        console.log(redisInfo, 'this is redis info from send');
    }

    async sendOTPMail(
        OTP: string,
        to: string,
        title: string,
        text: string = "This is your OTP, don't tell it to nobody. If you didn't request this password ignore this message. ??",
        html?: string,
    ) {
        await this.transport.sendMail({
            to,
            subject: title,
            text: text.replace('??', OTP),
            html,
        });
    }

    generateOTP() {
        return crypto.randomInt(100000, 1000000).toString();
    }

    async login(email: string, password: string) {
        const hashedPassword = this.hasher.hashPassword(password);
        const truthfulHashedPassword =
            await this.usersDatabaseController.getHashedPassword(email);
        return truthfulHashedPassword.hashed_password === hashedPassword;
    }
}
