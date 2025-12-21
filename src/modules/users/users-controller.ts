import { BasicController } from '../../common/basic-controller/basic-controller.js';
import type { UsersService } from './users-service.js';
import type { Request, Response, NextFunction } from 'express';
import { checkCorrectnessOfBody } from '../../utils/check-correctness-of-body.js';

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
            {
                path: '/assign',
                method: 'put',
                function: this.assignAdmin,
            },
        ]);
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        const body = req.body;
        checkCorrectnessOfBody(body, ['email']);
        const { email } = body;

        if (!req.user.isAdmin && req.user.email !== email) {
            res.status(403).send();
            return;
        }

        const result = await this.usersService.deleteUser(body.email);
        if (!result) {
            throw new Error("User doesn't exist.");
        }
        res.status(200).send('User deleted successfully.');
    }

    async assignAdmin(req: Request, res: Response, next: NextFunction) {
        const email = req.user.email;
        const isAdmin = req.user.isAdmin;
        const emailForChange = req.body.email;

        if (!emailForChange) {
            res.status(400).send("User's email is not transferred.");
            return;
        }
        if (!email) {
            res.status(401).send('User is not authorized.');
            return;
        }
        if (!isAdmin) {
            res.status(403).send('Only admins can appoint admins.');
            return;
        }

        const result = await this.usersService.assignAdmin(email);
        if (!result) {
            res.status(400).send(
                `User with email ${emailForChange} doesn't exist.`,
            );
            return;
        }
        res.status(201).send(`User with email ${email} is admin now.`);
    }
}
