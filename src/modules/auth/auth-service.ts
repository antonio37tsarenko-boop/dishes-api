import type { Hasher } from '../../security/hasher.js';
import type { RedisService } from '../redis/redis-service.js';
import { UsersService } from '../users/users-service.js';
import type { JwtService } from '../jwt/jwt-service.js';
import type { MailService } from '../mail/mail-service.js';
import type { OtpService } from '../otp/otp-service.js';
import * as bcrypt from 'bcrypt';

export class AuthService {
    redisService: RedisService;
    hasher: Hasher;
    jwtService: JwtService;
    usersService: UsersService;
    mailService: MailService;
    otpService: OtpService;

    constructor(
        redisService: RedisService,
        hasher: Hasher,
        jwtService: JwtService,
        usersService: UsersService,
        mailService: MailService,
        otpService: OtpService,
    ) {
        this.redisService = redisService;
        this.hasher = hasher;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.mailService = mailService;
        this.otpService = otpService;
    }

    async verifyOTP(email: string, OTP: number) {
        const data = await this.redisService.getAllHash(`verify:${email}`);
        if (
            typeof data.hashedPassword == 'string' &&
            typeof data.firstName == 'string' &&
            typeof data.lastName == 'string' &&
            Number(data.OTP) === OTP
        ) {
            await this.usersService.addUser(
                email,
                data.hashedPassword,
                data.firstName,
                data.lastName,
            );
            await this.redisService.deleteKey(`verify:${email}`);
            return this.jwtService.signJWT(email, process.env.SECRET);
        } else return false;
    }

    async sendOTP(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ) {
        const OTP = this.otpService.generateOTP();
        const hashedPassword = await this.hasher.hashPassword(password);
        await this.redisService.saveUserData(
            email,
            hashedPassword,
            firstName,
            lastName,
            Number(OTP),
        );
        await this.mailService.sendOTPMail(OTP, email, 'Your OTP');
    }

    async login(email: string, password: string) {
        const truthfulHashedPassword =
            await this.usersService.getHashedPassword(email);
        console.log(truthfulHashedPassword);
        console.log(password);
        console.log(this.hasher.hashPassword(password));
        if (
            await bcrypt.compare(
                password,
                truthfulHashedPassword.hashed_password,
            )
        ) {
            return this.jwtService.signJWT(email, process.env.SECRET);
        } else return false;
    }
}
