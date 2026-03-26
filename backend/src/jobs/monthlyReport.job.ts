import cron from 'node-cron';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import User from '../models/User';
import { getDb } from '../config/sqlite';

// runs 1st of every month at midnight
export const startMonthlyReportJob = () => {
    cron.schedule('0 0 1 * *', async () => {
        console.log('⏰ Running monthly report job...');

        try {
            const now = new Date();
            // generate report for previous month
            const month = now.getMonth() === 0 ? 12 : now.getMonth();
            const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);

            const users = await User.find({});
            const db = getDb();

            for (const user of users) {
                const uid = user._id as mongoose.Types.ObjectId;

                const spending = await Expense.aggregate([
                    {
                        $match: {
                            userId: uid,
                            date: { $gte: startOfMonth, $lte: endOfMonth },
                        },
                    },
                    { $group: { _id: '$category', total: { $sum: '$amount' } } },
                    { $sort: { total: -1 } },
                ]);

                const totalSpent = spending.reduce((s, c) => s + c.total, 0);
                const topCategory = spending[0]?._id || 'N/A';

                // overbudget check
                const budgets = await Budget.find({ userId: uid, month, year });
                const overbudget: string[] = [];
                budgets.forEach(b => {
                    const sp = spending.find(s => s._id === b.category);
                    if (sp && sp.total > b.limit) overbudget.push(b.category);
                });

                // upsert into SQLite
                db.prepare(`DELETE FROM monthly_reports WHERE user_id = ? AND month = ? AND year = ?`)
                    .run(uid.toString(), month, year);

                db.prepare(`
          INSERT INTO monthly_reports (user_id, month, year, total_spent, top_category, overbudget_categories)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uid.toString(), month, year, totalSpent, topCategory, JSON.stringify(overbudget));
            }

            console.log('✅ Monthly reports generated');
        } catch (err) {
            console.error('❌ Monthly report job failed:', err);
        }
    });

    console.log('📅 Monthly report cron scheduled');
};
