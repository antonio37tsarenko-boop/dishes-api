import type { Transporter } from 'nodemailer';
import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body';

export class OtpService {
    generateOTP() {
        return crypto.randomInt(100000, 1000000).toString();
    }
}
