import { Router } from 'express';
import { register, login, refresh, logout, getMe, registerSchema, loginSchema } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';

const r = Router();

r.post('/register', validate(registerSchema), register);
r.post('/login', validate(loginSchema), login);
r.post('/refresh', refresh);
r.post('/logout', protect, logout);
r.get('/me', protect, getMe);

export default r;
