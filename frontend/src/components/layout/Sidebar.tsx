'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Receipt, PiggyBank, FileText,
    Lightbulb, LogOut, Wallet, Menu, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/expenses', label: 'Expenses', icon: Receipt },
    { href: '/budgets', label: 'Budgets', icon: PiggyBank },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/suggestions', label: 'Suggestions', icon: Lightbulb },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggle}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 shadow-xl"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 z-40 h-screen w-64 flex flex-col transition-transform duration-300
                bg-slate-950/80 backdrop-blur-xl border-r border-white/5
                bg-gradient-to-b from-slate-950 via-slate-950 to-violet-950/20
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">FinTracker<span className="text-violet-500">+</span></span>
                    </Link>
                </div>

                {/* Nav links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {links.map(l => {
                        const active = pathname === l.href || pathname.startsWith(l.href + '/');
                        const Icon = l.icon;
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                                        ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-inner'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110 text-slate-500'}`} />
                                {l.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User area */}
                <div className="p-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 rounded-full flex items-center justify-center border border-violet-500/20">
                            <span className="text-violet-400 text-sm font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/20 border border-transparent transition-all duration-200 w-full group"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
