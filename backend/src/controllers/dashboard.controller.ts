import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import asyncHandler from '../utils/asyncHandler';

// GET /api/dashboard/summary
export const getSummary = asyncHandler(async (req: Request, res: Response) => {
    const uid = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // $facet aggregation for multiple results in one query
    const [result] = await Expense.aggregate([
        { $match: { userId: uid } },
        {
            $facet: {
                // total spent this month
                monthTotal: [
                    { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ],
                // category breakdown this month
                categoryBreakdown: [
                    { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
                    { $group: { _id: '$category', total: { $sum: '$amount' } } },
                    { $sort: { total: -1 } },
                ],
                // daily spending last 30 days
                dailySpending: [
                    { $match: { date: { $gte: thirtyDaysAgo } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                            total: { $sum: '$amount' },
                        },
                    },
                    { $sort: { _id: 1 } },
                ],
                // top payment methods this month
                topPaymentMethods: [
                    { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
                    { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } },
                    { $sort: { total: -1 } },
                ],
            },
        },
    ]);

    const totalSpent = result.monthTotal[0]?.total || 0;
    const topCategory = result.categoryBreakdown[0]?._id || 'N/A';

    // budget alerts
    const budgets = await Budget.find({
        userId: uid,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    });

    const spendMap: Record<string, number> = {};
    result.categoryBreakdown.forEach((c: any) => { spendMap[c._id] = c.total; });

    const budgetAlerts = budgets
        .map(b => {
            const spent = spendMap[b.category] || 0;
            const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
            return { category: b.category, limit: b.limit, spent, percentage: Math.round(pct) };
        })
        .filter(a => a.percentage >= 80)
        .sort((a, b) => b.percentage - a.percentage);

    res.json({
        success: true,
        data: {
            totalSpent,
            topCategory,
            categoryBreakdown: result.categoryBreakdown.map((c: any) => ({
                name: c._id,
                value: c.total,
            })),
            dailySpending: result.dailySpending.map((d: any) => ({
                date: d._id,
                amount: d.total,
            })),
            topPaymentMethods: result.topPaymentMethods.map((p: any) => ({
                name: p._id,
                value: p.total,
            })),
            budgetAlerts,
        },
    });
});
