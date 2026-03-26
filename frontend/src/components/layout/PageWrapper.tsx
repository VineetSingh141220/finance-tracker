'use client';
import { ReactNode } from 'react';

interface Props {
    title: string;
    action?: ReactNode;
    children: ReactNode;
}

export default function PageWrapper({ title, action, children }: Props) {
    return (
        <div className="lg:ml-64 min-h-screen bg-slate-950 transition-all duration-300">
            {/* Top bar */}
            <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-5 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Spacer for mobile hamburger */}
                        <div className="w-10 lg:hidden" />
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h1>
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            </header>
            
            {/* Content with centered container for large screens */}
            <main className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
                {children}
            </main>
        </div>
    );
}
