import { BasicController } from '../../common/basic-controller/basic-controller';
import type { UsersService } from './users-service';
import type { UserAccessService } from './user-access-service';

export class UsersController extends BasicController {
    usersService: UsersService;
    userAccessService: UserAccessService;
    constructor() {
        super();
    }
    bindUsersRoutes() {
        this.bindRoutes([
            {
                path: '/',
                method: 'delete',
                function: this.usersService.deleteUser,
            },
            {
                path: '/register',
                method: 'post',
                function: this.userAccessService.sendOTP,
            },
            {
                path: '/verify',
                method: 'post',
                function: this.userAccessService.verifyOTP,
            },
            {
                path: '/login',
                method: 'post',
                function: this.userAccessService.login,
            },
        ]);
    }
}
