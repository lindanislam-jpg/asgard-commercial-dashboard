import { Transaction, SavingsGoal } from './types';

export const formatCurrency = (amount: number, currency = 'EUR', locale = 'en-IE') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompact = (amount: number) => {
  if (Math.abs(amount) >= 1000) {
    return `€${(amount / 1000).toFixed(1)}k`;
  }
  return `€${amount.toFixed(0)}`;
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
};

export const getMonthYear = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' });
};

export const getTransactionsByMonth = (transactions: Transaction[], month: string) => {
  return transactions.filter(t => t.date.startsWith(month));
};

export const getMonthlyIncome = (transactions: Transaction[], month: string) => {
  return getTransactionsByMonth(transactions, month)
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getMonthlyExpenses = (transactions: Transaction[], month: string) => {
  return Math.abs(
    getTransactionsByMonth(transactions, month)
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );
};

export const getExpensesByCategory = (transactions: Transaction[], month?: string) => {
  const filtered = month
    ? transactions.filter(t => t.type === 'expense' && t.date.startsWith(month))
    : transactions.filter(t => t.type === 'expense');

  const byCategory: Record<string, number> = {};
  filtered.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
  });
  return byCategory;
};

export const getIncomeByCategory = (transactions: Transaction[], month?: string) => {
  const filtered = month
    ? transactions.filter(t => t.type === 'income' && t.date.startsWith(month))
    : transactions.filter(t => t.type === 'income');

  const byCategory: Record<string, number> = {};
  filtered.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  return byCategory;
};

export const calculateSavingsGoalCompletion = (goal: SavingsGoal): Date => {
  if (goal.monthlyContribution <= 0) return new Date(9999, 0, 1);
  const remaining = goal.targetAmount - goal.currentAmount;
  const monthsLeft = Math.ceil(remaining / goal.monthlyContribution);
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsLeft);
  return completionDate;
};

export const calculateFinancialHealthScore = (
  savingsRate: number,
  emergencyFundMonths: number,
  budgetAdherence: number,
  netWorthGrowth: number
): number => {
  const savingsScore = Math.min(savingsRate * 2.5, 25);
  const emergencyScore = Math.min((emergencyFundMonths / 6) * 25, 25);
  const budgetScore = Math.min(budgetAdherence * 25, 25);
  const growthScore = Math.min(Math.max(netWorthGrowth * 5, 0), 25);
  return Math.round(savingsScore + emergencyScore + budgetScore + growthScore);
};

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#6366F1',
  Utilities: '#8B5CF6',
  Food: '#10B981',
  Transport: '#3B82F6',
  Fuel: '#F97316',
  Insurance: '#EC4899',
  Entertainment: '#A855F7',
  Restaurants: '#F59E0B',
  Shopping: '#06B6D4',
  Health: '#EF4444',
  Education: '#14B8A6',
  Travel: '#0EA5E9',
  Subscriptions: '#6366F1',
  Investments: '#22C55E',
  Savings: '#84CC16',
  Miscellaneous: '#94A3B8',
  Salary: '#10B981',
  Freelance: '#A855F7',
  'Side Hustle': '#F59E0B',
  Gift: '#EC4899',
  Interest: '#3B82F6',
  Refund: '#06B6D4',
  'Investment Return': '#22C55E',
  Other: '#94A3B8',
};

export const EXPENSE_CATEGORIES = [
  'Housing', 'Utilities', 'Food', 'Transport', 'Fuel',
  'Insurance', 'Entertainment', 'Restaurants', 'Shopping',
  'Health', 'Education', 'Travel', 'Subscriptions',
  'Investments', 'Savings', 'Miscellaneous',
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Side Hustle', 'Gift',
  'Interest', 'Refund', 'Investment Return', 'Other',
];

export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');
