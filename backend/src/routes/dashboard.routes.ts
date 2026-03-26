import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller';
import { protect } from '../middleware/auth.middleware';

const r = Router();

r.get('/summary', protect, getSummary);

export default r;
