'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Spinner from '@/components/ui/Spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <div className="min-h-screen bg-slate-950" />;
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
            <Sidebar />
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
