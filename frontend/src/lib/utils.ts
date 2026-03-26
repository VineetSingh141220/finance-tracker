export const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(n);
};

export const formatDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const monthName = (m: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m - 1] || '';
};

// category colors for charts
export const CHART_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#06b6d4', '#ec4899', '#84cc16', '#a855f7'];
