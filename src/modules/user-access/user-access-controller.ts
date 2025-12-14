import { BasicController } from '../../common/basic-controller/basic-controller';
import type { UserAccessService } from './user-access-service';
import e from 'express';

export class UserAccessController extends BasicController {
    userAccessService: UserAccessService;

    bindUserAccessRoutes() {
        this.bindRoutes([
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
