import type { AuthService } from './auth-service';
import { BasicController } from '../../common/basic-controller/basic-controller';
import type { Request, Response, NextFunction } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body';

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
    }

    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, ['email', 'OTP']);
        const { email, OTP } = body;
        const result = await this.authService.verifyOTP(email, OTP);
        res.send(result);
    }
}
