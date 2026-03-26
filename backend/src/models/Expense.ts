import mongoose, { Document, Schema } from 'mongoose';

const CATEGORIES = [
    'Food', 'Rent', 'Shopping', 'Travel',
    'Entertainment', 'Health', 'Education', 'Utilities', 'Other'
] as const;

const PAYMENT_METHODS = [
    'UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Other'
] as const;

export type Category = typeof CATEGORIES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export interface IExpense extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    category: Category;
    date: Date;
    paymentMethod: PaymentMethod;
    notes?: string;
}

const expenseSchema = new Schema<IExpense>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: CATEGORIES },
    date: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
    notes: { type: String, trim: true, maxlength: 200 },
}, { timestamps: true });

// compound index for filtering
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

export { CATEGORIES, PAYMENT_METHODS };
export default mongoose.model<IExpense>('Expense', expenseSchema);
