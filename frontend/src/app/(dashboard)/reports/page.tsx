'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Report } from '@/types';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatCurrency, monthName } from '@/lib/utils';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/reports');
            setReports(data.data);
        } catch {
            toast.error('Failed to load reports');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const generateReport = async () => {
        setIsGenerating(true);
        try {
            await api.post('/reports/generate');
            toast.success('Report generated successfully!');
            fetchReports();
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <PageWrapper
            title="Monthly Reports"
            action={
                <Button onClick={generateReport} loading={isGenerating}>
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Generate This Month
                </Button>
            }
        >
            <Card className="p-0 overflow-hidden">
                {isLoading ? (
                    <Spinner />
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <FileText className="w-12 h-12 mb-4 text-slate-600" />
                        <p className="text-lg font-medium text-slate-300">No reports generated yet</p>
                        <p className="text-sm mt-1">Click the button above to generate your first monthly report.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/30 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Month</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Total Spent</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Top Category</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Budget Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase text-right">Generated At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {reports.map(r => (
                                    <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{monthName(r.month)} {r.year}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {formatCurrency(r.total_spent)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info">{r.top_category}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.overbudget_categories.length > 0 ? (
                                                <div className="flex items-center gap-1.5 text-rose-400 text-sm">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>{r.overbudget_categories.length} categories over limit</span>
                                                </div>
                                            ) : (
                                                <Badge variant="success">All budgets met</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 text-right">
                                            {new Date(r.created_at).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </PageWrapper>
    );
}
