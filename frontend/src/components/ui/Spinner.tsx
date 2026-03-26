import { Loader2 } from 'lucide-react';

export default function Spinner({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center py-12 ${className}`}>
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
    );
}

// skeleton loader
export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-700/50 rounded-lg ${className}`} />;
}
