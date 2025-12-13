import type { Request, Response, NextFunction } from 'express';

export interface IRoute {
    path: string;
    method: 'get' | 'post' | 'delete' | 'put';
    function(req: Request, res: Response, next: NextFunction): void;
}
