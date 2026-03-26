import { Router } from 'express';
import { getBudgets, upsertBudget, getBudgetAlerts, budgetSchema } from '../controllers/budget.controller';
import { protect } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';

const r = Router();

r.use(protect);

r.get('/', getBudgets);
r.post('/', validate(budgetSchema), upsertBudget);
r.get('/alerts', getBudgetAlerts);

export default r;
