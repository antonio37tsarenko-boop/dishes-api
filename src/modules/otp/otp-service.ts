import crypto from 'node:crypto';

export class OtpService {
    generateOTP() {
        return crypto.randomInt(100000, 1000000).toString();
    }
}
