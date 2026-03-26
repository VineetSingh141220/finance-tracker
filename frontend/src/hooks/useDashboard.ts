import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { DashboardSummary } from '@/types';

export function useDashboard() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get('/dashboard/summary');
            setData(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return { data, isLoading, error, refetch: fetchSummary };
}
