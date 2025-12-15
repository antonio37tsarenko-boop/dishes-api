import type { Hasher } from '../../security/hasher';
import type { RedisService } from '../redis/redis-service';
import { UsersService } from '../users/users-service';
import type { JwtService } from '../jwt/jwt-service';
import type { MailService } from '../mail/mail-service';
import type { OtpService } from '../otp/otp-service';

export class AuthService {
    redisService: RedisService;
    hasher: Hasher;
    jwtService: JwtService;
    usersService: UsersService;
    mailService: MailService;
    otpService: OtpService;

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
        const hashedPassword = this.hasher.hashPassword(password);
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
        const hashedPassword = this.hasher.hashPassword(password);
        const truthfulHashedPassword =
            await this.usersService.getHashedPassword(email);
        if (truthfulHashedPassword.hashed_password === hashedPassword) {
            return this.jwtService.signJWT(email, process.env.SECRET);
        } else return false;
    }
}
