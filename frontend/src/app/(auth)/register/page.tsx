'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Wallet, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const { register: signup } = useAuth();
    const router = useRouter();
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            await signup(data.name, data.email, data.password);
            toast.success('Account created!');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 items-center justify-center p-12">
                <div className="text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Wallet className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Join FinTracker+</h2>
                    <p className="text-violet-200 text-lg max-w-md">
                        Start your journey to financial freedom today.
                    </p>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-900">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
                        <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl">FinTracker+</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
                    <p className="text-slate-400 mb-6">Get started with your free account</p>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="text-rose-400 text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            error={errors.name?.message}
                            {...register('name')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPwd ? 'text' : 'password'}
                                placeholder="Min 6 characters"
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-[30px] text-slate-400 hover:text-slate-200"
                            >
                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            {...register('confirmPassword')}
                        />

                        <Button type="submit" loading={loading} className="w-full">
                            Create Account
                        </Button>
                    </form>

                    <p className="text-sm text-slate-400 mt-6 text-center">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
