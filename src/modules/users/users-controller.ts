import { BasicController } from '../../common/basic-controller/basic-controller';
import type { UsersService } from './users-service';
import type { Request, Response, NextFunction } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body';

export class UsersController extends BasicController {
    usersService: UsersService;

    constructor(usersService: UsersService) {
        super();
        this.usersService = usersService;
    }
    bindUsersRoutes() {
        this.bindRoutes([
            {
                path: '/',
                method: 'delete',
                function: this.deleteUser,
            },
        ]);
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, ['email']);
        await this.usersService.deleteUser(body.email);
    }
}
