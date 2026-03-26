import { Request, Response, NextFunction } from 'express';

// wraps async route handlers to catch errors
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default asyncHandler;
