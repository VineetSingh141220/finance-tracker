'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
    // close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
