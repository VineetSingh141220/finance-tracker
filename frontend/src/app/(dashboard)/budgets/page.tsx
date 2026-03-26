'use client';
import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/types';
import { Plus, PiggyBank, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const schema = z.object({
    category: z.string().min(1, 'Category is required'),
    limit: z.number().positive('Limit must be > 0'),
});

export default function BudgetsPage() {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const { alerts, isLoading, upsertBudget } = useBudgets(month, year);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const openAdd = () => {
        reset({ category: '', limit: 0 });
        setModalOpen(true);
    };

    const openEdit = (cat: string, limit: number) => {
        setValue('category', cat);
        setValue('limit', limit);
        setModalOpen(true);
    };

    const onSubmit = async (data: any) => {
        setSubmitLoading(true);
        try {
            await upsertBudget(data.category, data.limit);
            toast.success('Budget created/updated');
            setModalOpen(false);
        } catch {
            toast.error('Failed to save budget');
        } finally {
            setSubmitLoading(false);
        }
    };

    const unusedCategories = CATEGORIES.filter(c => !alerts.find(a => a.category === c));

    return (
        <PageWrapper
            title="Budgets"
            action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Set Budget</Button>}
        >
            {/* Month/Year Selector */}
            <Card className="mb-6 flex items-center gap-4">
                <Select
                    className="w-40"
                    value={month.toString()}
                    onChange={e => setMonth(parseInt(e.target.value))}
                    options={Array.from({ length: 12 }).map((_, i) => ({
                        value: (i + 1).toString(),
                        label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
                    }))}
                />
                <Select
                    className="w-32"
                    value={year.toString()}
                    onChange={e => setYear(parseInt(e.target.value))}
                    options={[currentYear - 1, currentYear, currentYear + 1].map(y => ({
                        value: y.toString(), label: y.toString()
                    }))}
                />
            </Card>

            {/* Budgets Grid */}
            {isLoading ? (
                <Spinner />
            ) : alerts.length === 0 ? (
                <div className="flex justify-center items-center h-64 border-2 border-dashed border-slate-700 rounded-xl">
                    <div className="text-center">
                        <PiggyBank className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No budgets set for this month</p>
                        <Button onClick={openAdd} variant="secondary">Create First Budget</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {alerts.map(b => (
                        <Card key={b.category} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <PiggyBank className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">{b.category}</h3>
                                </div>
                                <button
                                    onClick={() => openEdit(b.category, b.limit)}
                                    className="p-2 text-slate-400 hover:text-white bg-slate-700/30 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-400">Spent: {formatCurrency(b.spent)}</span>
                                    <span className="font-medium text-white">{formatCurrency(b.limit)}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
                                    <div
                                        className={`h-2.5 rounded-full transition-all duration-500 ${b.percentage >= 100 ? 'bg-rose-500' :
                                                b.percentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500">{b.percentage}% used</span>
                                    {b.percentage >= 100 ? (
                                        <Badge variant="danger">Exceeded</Badge>
                                    ) : b.percentage >= 80 ? (
                                        <Badge variant="warning">Nearing Limit</Badge>
                                    ) : (
                                        <Badge variant="success">On Track</Badge>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Set Budget Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Select
                        label="Category"
                        options={
                            unusedCategories.length > 0
                                ? [{ value: '', label: 'Select category' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]
                                : CATEGORIES.map(c => ({ value: c, label: c }))
                        }
                        error={errors.category?.message as string}
                        {...register('category')}
                    />
                    <Input
                        label="Monthly Limit (₹)"
                        type="number"
                        error={errors.limit?.message as string}
                        {...register('limit', { valueAsNumber: true })}
                    />

                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={submitLoading}>Save Budget</Button>
                    </div>
                </form>
            </Modal>
        </PageWrapper>
    );
}
