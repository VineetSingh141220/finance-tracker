'use client';
import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORIES, PAYMENT_METHODS, Expense } from '@/types';
import { Plus, Search, Filter, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const schema = z.object({
    amount: z.number().positive('Amount must be > 0'),
    category: z.string().min(1, 'Category is required'),
    date: z.string().min(1, 'Date is required'),
    paymentMethod: z.string().min(1, 'Payment method required'),
    notes: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

export default function ExpensesPage() {
    const { data, isLoading, filters, setFilters, createExpense, updateExpense, deleteExpense } = useExpenses({
        page: 1, limit: 10,
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { date: new Date().toISOString().split('T')[0] }
    });

    const openAdd = () => {
        setEditingId(null);
        reset({ date: new Date().toISOString().split('T')[0], amount: 0, category: '', paymentMethod: '', notes: '' });
        setModalOpen(true);
    };

    const openEdit = (exp: Expense) => {
        setEditingId(exp._id);
        setValue('amount', exp.amount);
        setValue('category', exp.category);
        setValue('paymentMethod', exp.paymentMethod);
        setValue('notes', exp.notes || '');
        setValue('date', new Date(exp.date).toISOString().split('T')[0]);
        setModalOpen(true);
    };

    const onSubmit = async (fd: FormData) => {
        setSubmitLoading(true);
        try {
            if (editingId) {
                await updateExpense(editingId, fd as any);
                toast.success('Expense updated');
            } else {
                await createExpense(fd as any);
                toast.success('Expense added');
            }
            setModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteExpense(deletingId);
            toast.success('Expense deleted');
        } catch {
            toast.error('Failed to delete expense');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <PageWrapper
            title="Expenses"
            action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Expense</Button>}
        >
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-[11px] text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            className="w-full bg-slate-700/50 border border-slate-600 text-slate-100 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-violet-500"
                            value={filters.search || ''}
                            onChange={e => setFilters({ search: e.target.value })}
                        />
                    </div>
                    <Select
                        options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
                        value={filters.category || ''}
                        onChange={e => setFilters({ category: e.target.value })}
                    />
                    <Select
                        options={[{ value: '', label: 'All Methods' }, ...PAYMENT_METHODS.map(c => ({ value: c, label: c }))]}
                        value={filters.paymentMethod || ''}
                        onChange={e => setFilters({ paymentMethod: e.target.value })}
                    />
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={filters.startDate || ''}
                            onChange={e => setFilters({ startDate: e.target.value })}
                        />
                        <Input
                            type="date"
                            value={filters.endDate || ''}
                            onChange={e => setFilters({ endDate: e.target.value })}
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                {isLoading ? (
                    <Spinner />
                ) : data?.expenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">No expenses found matching the criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/30 border-b border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Category</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Notes</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {data?.expenses.map(exp => (
                                    <tr key={exp._id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-300">{formatDate(exp.date)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            <span className="bg-slate-700 px-2 py-1 rounded text-xs">{exp.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-300">{exp.paymentMethod}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-white">{formatCurrency(exp.amount)}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400 truncate max-w-[200px]">{exp.notes || '-'}</td>
                                        <td className="px-4 py-3 flex gap-2 justify-end">
                                            <button onClick={() => openEdit(exp)} className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeletingId(exp._id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-700/50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {data && data.pagination.pages > 1 && (
                    <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                            Showing page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                disabled={data.pagination.page === 1}
                                onClick={() => setFilters({ page: data.pagination.page - 1 })}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="secondary"
                                disabled={data.pagination.page === data.pagination.pages}
                                onClick={() => setFilters({ page: data.pagination.page + 1 })}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Add/Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Expense' : 'Add Expense'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Amount (₹)" type="number" step="0.01" error={errors.amount?.message} {...register('amount', { valueAsNumber: true })} />
                    <Select
                        label="Category"
                        options={[{ value: '', label: 'Select category' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
                        error={errors.category?.message}
                        {...register('category')}
                    />
                    <Select
                        label="Payment Method"
                        options={[{ value: '', label: 'Select method' }, ...PAYMENT_METHODS.map(c => ({ value: c, label: c }))]}
                        error={errors.paymentMethod?.message}
                        {...register('paymentMethod')}
                    />
                    <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
                    <Input label="Notes (Optional)" placeholder="What was this for?" error={errors.notes?.message} {...register('notes')} />

                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={submitLoading}>{editingId ? 'Save Changes' : 'Create Expense'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Confirm Deletion">
                <div className="flex items-start gap-4 mb-4">
                    <div className="bg-rose-500/10 p-3 rounded-full"><AlertCircle className="w-6 h-6 text-rose-500" /></div>
                    <div>
                        <h3 className="text-white font-medium mb-1">Delete Expense</h3>
                        <p className="text-slate-400 text-sm">Are you sure you want to delete this expense? This action cannot be undone.</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </div>
            </Modal>
        </PageWrapper>
    );
}
