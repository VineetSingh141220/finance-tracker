'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { AnalysisResult } from '@/types';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { formatCurrency } from '@/lib/utils';
import { BrainCircuit, AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuggestionsPage() {
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const performAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // 1. Fetch data from our Node.js API
            const expensesRes = await api.get('/expenses?limit=500'); // get recent
            const budgetsRes = await api.get(`/budgets?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);

            const expenses = expensesRes.data.data.expenses;
            const budgets = budgetsRes.data.data;

            // 2. Send to Python Microservice for ML/Pandas analysis
            // Note: In production, the Node API would proxy this securely. 
            // Based on our instructions, the frontend calls the Node backend which forwards it?
            // Actually, per spec "python-service/app.py -> /analyze -> Input: { expenses: [...], budgets: [...] }"
            // I'll make the request to the python service directly based on env var
            const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

            const response = await fetch(`${pythonUrl}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses, budgets })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const result = await response.json();
            setData(result);
            toast.success('Analysis complete!');

        } catch (err) {
            console.error(err);
            toast.error('Failed to run AI analysis. Is the Python service running?');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'danger': return <AlertTriangle className="w-6 h-6 text-rose-400" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-400" />;
            case 'success': return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
            case 'tip': return <Lightbulb className="w-6 h-6 text-violet-400" />;
            default: return <Info className="w-6 h-6 text-blue-400" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'danger': return 'bg-rose-500/10 border-rose-500/20';
            case 'warning': return 'bg-amber-500/10 border-amber-500/20';
            case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'tip': return 'bg-violet-500/10 border-violet-500/20';
            default: return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <PageWrapper
            title="Smart Analysis"
            action={
                <Button onClick={performAnalysis} loading={isAnalyzing}>
                    <BrainCircuit className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                    {data ? 'Refresh Analysis' : 'Analyze My Spending'}
                </Button>
            }
        >
            {!data && !isAnalyzing ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mb-6">
                        <BrainCircuit className="w-8 h-8 text-violet-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">AI Spending Analysis</h2>
                    <p className="text-slate-400 max-w-md mb-8">
                        Click the button above to run our Pandas-powered analysis engine on your recent expenses and get personalized financial recommendations.
                    </p>
                    <Button onClick={performAnalysis}>Start Analysis</Button>
                </Card>
            ) : isAnalyzing ? (
                <Card className="py-20 text-center">
                    <Spinner className="mb-4" />
                    <p className="text-slate-400 animate-pulse">Running smart algorithms...</p>
                </Card>
            ) : data ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Box */}
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-violet-500/20">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Analysis Context</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Total Analyzed</p>
                                <p className="font-semibold text-white">{formatCurrency(data.analysis.total)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Timeframe</p>
                                <p className="font-semibold text-white">Last {data.analysis.days_covered} days</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Highest Spend Cat.</p>
                                <p className="font-semibold text-white">{data.analysis.top_category}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Insight Count</p>
                                <p className="font-semibold text-white">{data.suggestions.length} rules triggered</p>
                            </div>
                        </div>
                    </Card>

                    {/* Suggestions List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.suggestions.map((s, i) => (
                            <div
                                key={i}
                                className={`p-5 rounded-xl border flex items-start hidden gap-4 transition-transform hover:-translate-y-1 ${getColor(s.type)}`}
                                style={{ display: 'flex' }}
                            >
                                <div className="mt-1 shrink-0 bg-white/5 p-2 rounded-lg backdrop-blur-sm">
                                    {getIcon(s.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-200 leading-relaxed font-medium">{s.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </PageWrapper>
    );
}
