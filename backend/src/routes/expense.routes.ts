import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense, createExpenseSchema, updateExpenseSchema } from '../controllers/expense.controller';
import { protect } from '../middleware/auth.middleware';
import validate from '../middleware/validate.middleware';

const r = Router();

r.use(protect); // all expense routes are protected

r.get('/', getExpenses);
r.post('/', validate(createExpenseSchema), createExpense);
r.put('/:id', validate(updateExpenseSchema), updateExpense);
r.delete('/:id', deleteExpense);

export default r;
