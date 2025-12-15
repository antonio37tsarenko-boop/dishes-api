import { type Transporter } from 'nodemailer';
import * as crypto from 'node:crypto';
import type { Hasher } from '../../security/hasher';
import type { RedisService } from '../redis/redis-service';
import type { Request, Response, NextFunction } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body';
import { UsersService } from './users-service';
import type { JwtService } from '../jwt/jwt-service';

export class UserAccessService extends UsersService {
    transport: Transporter;
    redisService: RedisService;
    hasher: Hasher;
    jwtService: JwtService;

    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, ['email', 'OTP']);
        const { email, OTP } = body;
        const data = await this.redisService.getAllHash(`verify:${email}`);
        if (
            typeof data.hashedPassword == 'string' &&
            typeof data.firstName == 'string' &&
            typeof data.lastName == 'string' &&
            Number(data.OTP) === OTP
        ) {
            await this.addUser(
                email,
                data.hashedPassword,
                data.firstName,
                data.lastName,
            );
            await this.redisService.deleteKey(`verify:${email}`);
            return this.jwtService.signJWT(email, process.env.SECRET);
        } else return false;
    }

    async sendOTP(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, [
            'email',
            'hashedPassword',
            'firstName',
            'lastName',
        ]);
        const { email, password, firstName, lastName } = body;

        const OTP = this.generateOTP();
        const hashedPassword = this.hasher.hashPassword(password);
        await this.redisService.saveUserData(
            email,
            hashedPassword,
            firstName,
            lastName,
            Number(OTP),
        );
        await this.sendOTPMail(OTP, email, 'Your OTP');
        res.send('mail is sent successfully.');
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

    async login(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, ['email', 'password']);
        const { email, password } = body;

        const hashedPassword = this.hasher.hashPassword(password);
        const truthfulHashedPassword = await this.getHashedPassword(email);
        if (truthfulHashedPassword.hashed_password === hashedPassword) {
            return this.jwtService.signJWT(email, process.env.SECRET);
        } else return false;
    }
}
