'use client';
import { useDashboard } from '@/hooks/useDashboard';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatCurrency, CHART_COLORS } from '@/lib/utils';
import { Lightbulb, TrendingUp, AlertCircle, ArrowUpRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

export default function DashboardPage() {
    const { data, isLoading, error } = useDashboard();

    if (isLoading) return <PageWrapper title="Dashboard"><Spinner /></PageWrapper>;
    if (error || !data) return <PageWrapper title="Dashboard"><div className="text-rose-400">{error || 'No data'}</div></PageWrapper>;

    // Custom Recharts Tooltip styles for dark theme
    const customTooltip = {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        color: '#f1f5f9',
        borderRadius: '0.5rem',
    };

    return (
        <PageWrapper
            title="Dashboard"
            action={
                <Link href="/suggestions">
                    <Button variant="secondary"><Lightbulb className="w-4 h-4" /> Get Suggestions</Button>
                </Link>
            }
        >
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Total Spent This Month</p>
                            <h3 className="text-2xl font-bold text-white">{formatCurrency(data.totalSpent)}</h3>
                        </div>
                        <div className="bg-violet-500/10 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-violet-400" />
                        </div>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Top Category</p>
                            <h3 className="text-2xl font-bold text-white">{data.topCategory}</h3>
                        </div>
                        <div className="bg-amber-500/10 p-2 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-amber-400" />
                        </div>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Budget Alerts</p>
                            <h3 className="text-2xl font-bold text-white">{data.budgetAlerts.length} Active</h3>
                        </div>
                        <div className="bg-rose-500/10 p-2 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-rose-400" />
                        </div>
                    </div>
                </Card>

                <Card className="flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Total Expenses</p>
                            <h3 className="text-2xl font-bold text-white">{data.dailySpending.reduce((a, b) => a + b.amount, 0) > 0 ? 'Active' : 'No Data'}</h3>
                        </div>
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Wallet className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Daily Spending Line Chart */}
                <Card className="lg:col-span-2 min-h-[350px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Spending Trends (Last 30 Days)</h3>
                    {data.dailySpending.length > 0 ? (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.dailySpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                    <RechartsTooltip formatter={(val: any) => formatCurrency(val as number)} contentStyle={customTooltip} itemStyle={{ color: '#8b5cf6' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-slate-500">No data available</div>
                    )}
                </Card>

                {/* Category breakdown Pie Chart */}
                <Card className="min-h-[350px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
                    {data.categoryBreakdown.length > 0 ? (
                        <div className="h-72 w-full flex flex-col">
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={data.categoryBreakdown}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={2} dataKey="value"
                                    >
                                        {data.categoryBreakdown.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(val: any) => formatCurrency(val as number)} contentStyle={customTooltip} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 overflow-y-auto">
                                {data.categoryBreakdown.map((item, i) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                            <span className="text-slate-300">{item.name}</span>
                                        </div>
                                        <span className="font-medium text-white">{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-slate-500">No data available</div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods Bar Chart */}
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Top Payment Methods</h3>
                    {data.topPaymentMethods.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topPaymentMethods} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip formatter={(val: any) => formatCurrency(val as number)} cursor={{ fill: '#334155' }} contentStyle={customTooltip} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>
                    )}
                </Card>

                {/* Budget Alerts List */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Budget Alerts</h3>
                        <Link href="/budgets" className="text-sm text-violet-400 hover:text-violet-300">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {data.budgetAlerts.length > 0 ? (
                            data.budgetAlerts.map(alert => (
                                <div key={alert.category} className="p-4 rounded-lg bg-slate-700/30 border border-slate-700 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-200">{alert.category}</span>
                                        <Badge variant={alert.percentage >= 100 ? 'danger' : 'warning'}>
                                            {alert.percentage}% used
                                        </Badge>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                        <div
                                            className={`h-1.5 rounded-full ${alert.percentage >= 100 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                            style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                        <span>Spent: {formatCurrency(alert.spent)}</span>
                                        <span>Limit: {formatCurrency(alert.limit)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-slate-500">
                                <Badge variant="success">All budgets looking good!</Badge>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </PageWrapper>
    );
}
