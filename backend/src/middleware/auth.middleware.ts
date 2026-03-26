import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import User from '../models/User';
import ApiError from '../utils/ApiError';

// extend Request type
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            throw new ApiError(401, 'Not authorized — no token');
        }

        const token = header.split(' ')[1];
        const decoded = verifyAccessToken(token);

        const user = await User.findById(decoded.id);
        if (!user) throw new ApiError(401, 'User not found');

        req.user = user;
        next();
    } catch (err: any) {
        // handle expired/invalid JWT
        if (err.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'TOKEN_EXPIRED'));
        }
        if (err.name === 'JsonWebTokenError') {
            return next(new ApiError(401, 'Invalid token'));
        }
        next(err);
    }
};

// role check middleware
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return next(new ApiError(403, 'Admin access required'));
    }
    next();
};
