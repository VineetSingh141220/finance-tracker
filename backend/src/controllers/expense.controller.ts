import { Request, Response } from 'express';
import { z } from 'zod';
import Expense, { CATEGORIES, PAYMENT_METHODS } from '../models/Expense';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';

// --- Zod Schemas ---
export const createExpenseSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
    date: z.string().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS as unknown as [string, ...string[]]),
    notes: z.string().max(200).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

// GET /api/expenses
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user._id;
    const { category, paymentMethod, startDate, endDate, search, page = '1', limit = '10' } = req.query;

    const filter: any = { userId: uid };

    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate as string);
        if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    if (search) {
        filter.notes = { $regex: search, $options: 'i' };
    }

    const pg = Math.max(1, parseInt(page as string));
    const lim = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pg - 1) * lim;

    const [expenses, total] = await Promise.all([
        Expense.find(filter).sort({ date: -1 }).skip(skip).limit(lim),
        Expense.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            expenses,
            pagination: { page: pg, limit: lim, total, pages: Math.ceil(total / lim) },
        },
    });
});

// POST /api/expenses
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
    const expense = await Expense.create({
        ...req.body,
        userId: req.user._id,
        date: req.body.date ? new Date(req.body.date) : new Date(),
    });

    res.status(201).json({ success: true, data: expense });
});

// PUT /api/expenses/:id
export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id);
    if (!expense) throw new ApiError(404, 'Expense not found');

    // ownership check
    if (expense.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Not authorized');
    }

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true,
    });

    res.json({ success: true, data: updated });
});

// DELETE /api/expenses/:id
export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
    const expense = await Expense.findById(req.params.id);
    if (!expense) throw new ApiError(404, 'Expense not found');

    if (expense.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'Not authorized');
    }

    await expense.deleteOne();
    res.json({ success: true, data: null });
});
