export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  notes?: string;
  recurring?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  budgeted: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDay: number;
  paid: boolean;
  recurring: boolean;
  icon: string;
}

export interface NetWorthItem {
  id: string;
  name: string;
  category: string;
  itemType: 'asset' | 'liability';
  amount: number;
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  renewal: string;
  used: boolean;
  icon: string;
  color: string;
}

export interface AppNotification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
