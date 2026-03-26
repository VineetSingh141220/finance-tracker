import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// validates req.body against a Zod schema
const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const msgs = result.error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ success: false, message: msgs });
        }
        req.body = result.data;
        next();
    };
};

export default validate;
