import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db';
import { initSqlite, getDb } from '../config/sqlite';
import User from '../models/User';
import Expense from '../models/Expense';
import Budget from '../models/Budget';
import { CATEGORIES, PAYMENT_METHODS } from '../models/Expense';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

const seed = async () => {
    try {
        await connectDB();
        initSqlite();

        console.log('🌱 Seeding database...');

        // --- Users ---
        const adminData = { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' as const };
        const userData = { name: 'Vineet Singh', email: 'vineet@fintracker.com', password: 'Vineet@123', role: 'user' as const };

        // upsert admin
        let admin = await User.findOne({ email: adminData.email });
        if (!admin) {
            admin = await User.create(adminData);
            console.log('  ✅ Admin created');
        } else {
            console.log('  ⏭️  Admin exists');
        }

        // upsert user
        let user = await User.findOne({ email: userData.email });
        if (!user) {
            user = await User.create(userData);
            console.log('  ✅ Vineet user created');
        } else {
            console.log('  ⏭️  Vineet user exists');
        }

        const uid = user._id;

        // --- Expenses (60 random, last 3 months) ---
        const existingCount = await Expense.countDocuments({ userId: uid });
        if (existingCount === 0) {
            const now = new Date();
            const expenses = [];

            for (let i = 0; i < 60; i++) {
                const daysAgo = randInt(0, 90);
                const d = new Date(now);
                d.setDate(d.getDate() - daysAgo);

                expenses.push({
                    userId: uid,
                    amount: randInt(50, 5000),
                    category: pick(CATEGORIES),
                    date: d,
                    paymentMethod: pick(PAYMENT_METHODS),
                    notes: `Seed expense #${i + 1}`,
                });
            }

            await Expense.insertMany(expenses);
            console.log('  ✅ 60 expenses created');
        } else {
            console.log(`  ⏭️  ${existingCount} expenses exist`);
        }

        // --- Budgets (current month, all categories) ---
        const curMonth = new Date().getMonth() + 1;
        const curYear = new Date().getFullYear();

        for (const cat of CATEGORIES) {
            await Budget.findOneAndUpdate(
                { userId: uid, month: curMonth, year: curYear, category: cat },
                { limit: randInt(2000, 10000) },
                { upsert: true, new: true }
            );
        }
        console.log('  ✅ Budgets set for current month');

        // --- SQLite reports (last 2 months) ---
        const db = getDb();
        for (let i = 1; i <= 2; i++) {
            let m = curMonth - i;
            let y = curYear;
            if (m <= 0) { m += 12; y -= 1; }

            const exists = db.prepare(
                'SELECT id FROM monthly_reports WHERE user_id = ? AND month = ? AND year = ?'
            ).get(uid!.toString(), m, y);

            if (!exists) {
                db.prepare(`
          INSERT INTO monthly_reports (user_id, month, year, total_spent, top_category, overbudget_categories)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uid!.toString(), m, y, randInt(10000, 40000), pick(CATEGORIES), JSON.stringify([pick(CATEGORIES)]));
            }
        }
        console.log('  ✅ SQLite reports seeded');

        console.log('\n✅ Seed complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
};

seed();
