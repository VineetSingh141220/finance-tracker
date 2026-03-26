import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: Props) {
    return (
        <div 
            onClick={onClick}
            className={`
                bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 
                transition-all duration-300 hover:border-violet-500/20 hover:bg-slate-900/60
                group ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}
            `}
        >
            {children}
        </div>
    );
}
