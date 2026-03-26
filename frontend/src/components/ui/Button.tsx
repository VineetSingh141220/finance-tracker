import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    loading?: boolean;
    children: ReactNode;
}

export default function Button({ variant = 'primary', loading, children, className = '', ...props }: Props) {
    const base = 'text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95';

    const variants = {
        primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-600/20 border border-violet-400/20',
        secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm',
        danger: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 outline-none',
        ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
    };

    return (
        <button
            className={`${base} ${variants[variant]} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}
