import { Redis } from 'ioredis';

export class RedisService {
    redis: Redis;
    constructor() {
        this.redis = new Redis({
            host: 'localhost',
            port: process.env.REDIS_PORT,
        });
        this.redis.on('ready', () => {
            console.log('Redis is on.');
        });
    }
    async saveUserData(
        email: string,
        hashedPassword: string,
        firstName: string,
        lastName: string,
        OTP: number,
    ) {
        const str = `verify:${email}`;
        await this.redis.hset(str, {
            email,
            hashedPassword,
            firstName,
            lastName,
            OTP,
        });
        await this.redis.expire(str, 600);
    }

    async getAllHash(key: string) {
        return this.redis.hgetall(key);
    }

    async deleteKey(key: string) {
        await this.redis.del(key);
    }
}
