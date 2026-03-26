import { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Budget from '../models/Budget';
import Expense from '../models/Expense';
import asyncHandler from '../utils/asyncHandler';

export const budgetSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2020),
    category: z.string().min(1),
    limit: z.number().positive('Limit must be positive'),
});

// GET /api/budgets?month=3&year=2026
export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user._id;
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const budgets = await Budget.find({ userId: uid, month, year });
    res.json({ success: true, data: budgets });
});

// POST /api/budgets — upsert
export const upsertBudget = asyncHandler(async (req: Request, res: Response) => {
    const { month, year, category, limit } = req.body;
    const uid = req.user._id;

    const budget = await Budget.findOneAndUpdate(
        { userId: uid, month, year, category },
        { limit },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: budget });
});

// GET /api/budgets/alerts — categories at 80%+
export const getBudgetAlerts = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month as string) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string) || now.getFullYear();

    const budgets = await Budget.find({ userId: uid, month, year });

    // get start/end of month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // sum expenses per category
    const spending = await Expense.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(uid),
                date: { $gte: startOfMonth, $lte: endOfMonth },
            },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    const spendMap: Record<string, number> = {};
    spending.forEach(s => { spendMap[s._id] = s.total; });

    const alerts = budgets
        .map(b => {
            const spent = spendMap[b.category] || 0;
            const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            return { category: b.category, limit: b.limit, spent, percentage: Math.round(pct) };
        })
        .filter(a => a.percentage >= 80)
        .sort((a, b) => b.percentage - a.percentage);

    res.json({ success: true, data: alerts });
});
