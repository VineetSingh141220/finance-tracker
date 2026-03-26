import { Router } from 'express';
import { getReports, generateReport } from '../controllers/report.controller';
import { protect } from '../middleware/auth.middleware';

const r = Router();

r.use(protect);

r.get('/', getReports);
r.post('/generate', generateReport);

export default r;
