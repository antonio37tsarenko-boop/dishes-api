import type { AuthService } from './auth-service.js';
import { BasicController } from '../../common/basic-controller/basic-controller.js';
import type { Request, Response, NextFunction } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body.js';

export class AuthController extends BasicController {
    authService: AuthService;

    constructor(authService: AuthService) {
        super();
        this.authService = authService;
    }

    bindAuthRoutes() {
        this.bindRoutes([
            {
                path: '/register',
                method: 'post',
                function: this.sendOTP,
            },
            {
                path: '/verify',
                method: 'post',
                function: this.verifyOTP,
            },
            {
                path: '/login',
                method: 'post',
                function: this.login,
            },
        ]);
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, ['email', 'password']);
        const { email, password } = body;
        const result = await this.authService.login(email, password);
        res.send(result);
    }

    async sendOTP(req: Request, res: Response, next: NextFunction) {
        const body = req.body;

        checkCorrectnessOfBody(body, [
            'email',
            'password',
            'firstName',
            'lastName',
        ]);
        const { email, password, firstName, lastName } = body;
        await this.authService.sendOTP(email, password, firstName, lastName);

        res.send(true);
    }

    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        console.log('verifyOTP is working!');
        const body = req.body;
        checkCorrectnessOfBody(body, ['email', 'OTP']);
        const { email, OTP } = body;
        console.log(email, OTP);
        const result = await this.authService.verifyOTP(email, Number(OTP));
        res.send(result);
    }
}
