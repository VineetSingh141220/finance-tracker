import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full bg-slate-700/50 border border-slate-600 text-slate-100 text-sm rounded-lg px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors ${error ? 'border-rose-500' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
export default Input;
