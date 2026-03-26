// --- User ---
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

// --- Expense ---
export interface Expense {
    _id: string;
    userId: string;
    amount: number;
    category: Category;
    date: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    createdAt: string;
}

export type Category =
    | 'Food' | 'Rent' | 'Shopping' | 'Travel'
    | 'Entertainment' | 'Health' | 'Education' | 'Utilities' | 'Other';

export type PaymentMethod =
    | 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking' | 'Other';

export const CATEGORIES: Category[] = [
    'Food', 'Rent', 'Shopping', 'Travel',
    'Entertainment', 'Health', 'Education', 'Utilities', 'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
    'UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Other',
];

// --- Budget ---
export interface Budget {
    _id: string;
    userId: string;
    month: number;
    year: number;
    category: string;
    limit: number;
}

// --- Dashboard ---
export interface DashboardSummary {
    totalSpent: number;
    topCategory: string;
    categoryBreakdown: { name: string; value: number }[];
    dailySpending: { date: string; amount: number }[];
    topPaymentMethods: { name: string; value: number }[];
    budgetAlerts: BudgetAlert[];
}

export interface BudgetAlert {
    category: string;
    limit: number;
    spent: number;
    percentage: number;
}

// --- Report ---
export interface Report {
    id: number;
    user_id: string;
    month: number;
    year: number;
    total_spent: number;
    top_category: string;
    overbudget_categories: string[];
    created_at: string;
}

// --- Suggestion ---
export interface Suggestion {
    type: 'danger' | 'warning' | 'tip' | 'info' | 'success';
    message: string;
}

export interface AnalysisResult {
    suggestions: Suggestion[];
    analysis: {
        total: number;
        by_category: Record<string, number>;
        top_category: string;
        days_covered: number;
    };
}

// --- API ---
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedData<T> {
    expenses: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
