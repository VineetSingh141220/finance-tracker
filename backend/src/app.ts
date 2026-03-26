import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/db';
import { initSqlite } from './config/sqlite';
import errorHandler from './middleware/errorHandler';
import { startMonthlyReportJob } from './jobs/monthlyReport.job';

import authRoutes from './routes/auth.routes';
import expenseRoutes from './routes/expense.routes';
import budgetRoutes from './routes/budget.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security middleware ---
app.use(helmet());
const corsOptions = {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

// --- Rate limiting ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, try again later' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many auth attempts' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// health check
app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
});

// --- Error handler ---
app.use(errorHandler);

// --- Start server ---
const start = async () => {
    try {
        await connectDB();
        initSqlite();
        startMonthlyReportJob();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

start();

export default app;
