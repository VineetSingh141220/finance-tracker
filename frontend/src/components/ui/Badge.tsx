interface Props {
    variant?: 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
}

export default function Badge({ variant = 'info', children }: Props) {
    const styles = {
        success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
        danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
        info: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    };

    return (
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[variant]}`}>
            {children}
        </span>
    );
}
