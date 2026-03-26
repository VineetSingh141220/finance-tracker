import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const msgs = Object.values(err.errors).map((e: any) => e.message);
        message = msgs.join(', ');
    }

    // Bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID';
    }

    // Duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = `${field || 'Field'} already exists`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'TOKEN_EXPIRED';
    }

    if (process.env.NODE_ENV === 'development' && statusCode === 500) {
        console.error('🔥 Error:', err);
    }

    res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
