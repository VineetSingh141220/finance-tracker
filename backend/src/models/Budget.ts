import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
    userId: mongoose.Types.ObjectId;
    month: number;
    year: number;
    category: string;
    limit: number;
}

const budgetSchema = new Schema<IBudget>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// unique compound index
budgetSchema.index({ userId: 1, month: 1, year: 1, category: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', budgetSchema);
