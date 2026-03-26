import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';

// --- Zod Schemas ---
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 chars'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 chars'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

// helper: set refresh cookie
const setRefreshCookie = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
};

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(409, 'Email already registered');

    const user = await User.create({ name, email, password });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    // store hashed refresh token
    user.refreshToken = await bcrypt.hash(refreshToken, 12);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
        success: true,
        data: { user, accessToken },
    });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const match = await user.comparePassword(password);
    if (!match) throw new ApiError(401, 'Invalid credentials');

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(refreshToken, 12);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    // strip password before sending
    user.password = undefined as any;

    res.json({ success: true, data: { user, accessToken } });
});

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new ApiError(401, 'No refresh token');

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken) throw new ApiError(401, 'Invalid refresh token');

    const valid = await bcrypt.compare(token, user.refreshToken);
    if (!valid) throw new ApiError(401, 'Invalid refresh token');

    // rotate tokens
    const newAccess = signAccessToken(user._id.toString());
    const newRefresh = signRefreshToken(user._id.toString());

    user.refreshToken = await bcrypt.hash(newRefresh, 12);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefresh);

    res.json({ success: true, data: { accessToken: newAccess } });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
    // clear refresh token from DB
    if (req.user) {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, data: null });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: req.user });
});
