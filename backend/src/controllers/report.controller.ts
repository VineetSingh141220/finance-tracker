import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import { getDb } from '../config/sqlite';
import asyncHandler from '../utils/asyncHandler';

// GET /api/reports — last 3 months from SQLite
export const getReports = asyncHandler(async (req: Request, res: Response) => {
    const db = getDb();
    const uid = req.user._id.toString();

    const rows = db.prepare(`
    SELECT * FROM monthly_reports 
    WHERE user_id = ? 
    ORDER BY year DESC, month DESC 
    LIMIT 3
  `).all(uid);

    // parse overbudget_categories JSON
    const reports = rows.map((r: any) => ({
        ...r,
        overbudget_categories: JSON.parse(r.overbudget_categories || '[]'),
    }));

    res.json({ success: true, data: reports });
});

// POST /api/reports/generate — manually generate for month/year
export const generateReport = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user._id;
    const month = parseInt(req.body.month) || new Date().getMonth() + 1;
    const year = parseInt(req.body.year) || new Date().getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // aggregate expenses
    const spending = await Expense.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(uid),
                date: { $gte: startOfMonth, $lte: endOfMonth },
            },
        },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
    ]);

    const totalSpent = spending.reduce((s, c) => s + c.total, 0);
    const topCategory = spending[0]?._id || 'N/A';

    // check overbudget
    const budgets = await Budget.find({ userId: uid, month, year });
    const overbudget: string[] = [];
    budgets.forEach(b => {
        const sp = spending.find(s => s._id === b.category);
        if (sp && sp.total > b.limit) overbudget.push(b.category);
    });

    const db = getDb();

    // delete existing report for same month/year/user
    db.prepare(`
    DELETE FROM monthly_reports WHERE user_id = ? AND month = ? AND year = ?
  `).run(uid.toString(), month, year);

    // insert new
    db.prepare(`
    INSERT INTO monthly_reports (user_id, month, year, total_spent, top_category, overbudget_categories)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(uid.toString(), month, year, totalSpent, topCategory, JSON.stringify(overbudget));

    res.json({
        success: true,
        data: { month, year, totalSpent, topCategory, overbudget },
    });
});
