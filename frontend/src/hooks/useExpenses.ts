import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { Expense, PaginatedData } from '@/types';

interface Filters {
    category?: string;
    paymentMethod?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
}

export function useExpenses(initialFilters: Filters) {
    const [data, setData] = useState<PaginatedData<Expense> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>(initialFilters);

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const p = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (v) p.append(k, v.toString());
            });
            const res = await api.get(`/expenses?${p.toString()}`);
            setData(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load expenses');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const createExpense = async (payload: Partial<Expense>) => {
        await api.post('/expenses', payload);
        fetchExpenses();
    };

    const updateExpense = async (id: string, payload: Partial<Expense>) => {
        await api.put(`/expenses/${id}`, payload);
        fetchExpenses();
    };

    const deleteExpense = async (id: string) => {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
    };

    return {
        data,
        isLoading,
        error,
        filters,
        setFilters: (f: Partial<Filters>) => setFilters(prev => ({ ...prev, ...f, page: f.page || 1 })),
        createExpense,
        updateExpense,
        deleteExpense,
    };
}
