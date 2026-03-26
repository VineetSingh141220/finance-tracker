import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    refreshToken?: string;
    comparePassword(pwd: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshToken: { type: String, select: false },
}, { timestamps: true });

// hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (pwd: string) {
    return bcrypt.compare(pwd, this.password);
};

// never return password in JSON
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        return ret;
    },
});

export default mongoose.model<IUser>('User', userSchema);
