import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { BudgetAlert } from '@/types';

export function useBudgets(month: number, year: number) {
    const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // The dashboard summary endpoint returns all budget alerts for the month
            // This is a convenient way to get progress for all category budgets
            const res = await api.get('/dashboard/summary');

            // Get all budgets for the month (even those at 0%)
            const { data } = await api.get(`/budgets?month=${month}&year=${year}`);

            // Merge with spending data from dashboard
            // Note: In a real app we'd have a specific endpoint for this, 
            // but we'll use the existing /dashboard/summary and /budgets to calculate progress
            const budgetList = data.data;
            const spendingRes = await api.get('/dashboard/summary');
            const spendMap: Record<string, number> = {};

            spendingRes.data.data.categoryBreakdown.forEach((c: any) => {
                spendMap[c.name] = c.value;
            });

            const merged = budgetList.map((b: any) => {
                const spent = spendMap[b.category] || 0;
                const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                return {
                    category: b.category,
                    limit: b.limit,
                    spent,
                    percentage: Math.round(pct)
                };
            });

            setAlerts(merged);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load budgets');
        } finally {
            setIsLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const upsertBudget = async (category: string, limit: number) => {
        await api.post('/budgets', { month, year, category, limit });
        fetchAlerts();
    };

    return { alerts, isLoading, error, upsertBudget };
}
