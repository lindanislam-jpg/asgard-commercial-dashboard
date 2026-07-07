import { create } from 'zustand';
import { Transaction, Budget, SavingsGoal, Bill, Subscription, NetWorthItem, ChatMessage } from './types';

interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  subscriptions: Subscription[];
  netWorthItems: NetWorthItem[];
  chatMessages: ChatMessage[];
  dismissedNotifications: string[];
  darkMode: boolean;
  currentMonth: string;

  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  updateBudget: (id: string, budgeted: number) => void;

  addSavingsGoal: (g: SavingsGoal) => void;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;

  addBill: (b: Bill) => void;
  updateBill: (id: string, b: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  updateBillPaid: (id: string, paid: boolean) => void;

  addSubscription: (s: Subscription) => void;
  updateSubscription: (id: string, s: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  addNetWorthItem: (item: NetWorthItem) => void;
  updateNetWorthItem: (id: string, item: Partial<NetWorthItem>) => void;
  deleteNetWorthItem: (id: string) => void;

  addChatMessage: (msg: ChatMessage) => void;
  dismissNotification: (id: string) => void;
  toggleDarkMode: () => void;
  setCurrentMonth: (month: string) => void;
}

const TRANSACTIONS: Transaction[] = [
  // January 2026
  { id: 'j01', date: '2026-01-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'j02', date: '2026-01-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'j03', date: '2026-01-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'j04', date: '2026-01-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'j05', date: '2026-01-07', description: 'Lidl Groceries', amount: -87.40, type: 'expense', category: 'Food' },
  { id: 'j06', date: '2026-01-10', description: 'Car Insurance', amount: -95, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'j07', date: '2026-01-10', description: 'Health Insurance', amount: -55, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'j08', date: '2026-01-12', description: 'Restaurant Dinner', amount: -48, type: 'expense', category: 'Restaurants' },
  { id: 'j09', date: '2026-01-13', description: 'Fuel Top-up', amount: -62, type: 'expense', category: 'Fuel' },
  { id: 'j10', date: '2026-01-15', description: 'Electricity Bill', amount: -68, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'j11', date: '2026-01-15', description: 'Gas Bill', amount: -46, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'j12', date: '2026-01-16', description: 'Tesco Groceries', amount: -74.30, type: 'expense', category: 'Food' },
  { id: 'j13', date: '2026-01-17', description: 'Monthly Bus Pass', amount: -45, type: 'expense', category: 'Transport', recurring: true },
  { id: 'j14', date: '2026-01-18', description: 'Coffee & Lunch', amount: -22.50, type: 'expense', category: 'Restaurants' },
  { id: 'j15', date: '2026-01-20', description: 'Internet Bill', amount: -35, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'j16', date: '2026-01-21', description: 'Amazon Order', amount: -89.99, type: 'expense', category: 'Shopping' },
  { id: 'j17', date: '2026-01-22', description: 'Phone Bill', amount: -45, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'j18', date: '2026-01-22', description: 'Gym Membership', amount: -35, type: 'expense', category: 'Health', recurring: true },
  { id: 'j19', date: '2026-01-24', description: 'Aldi Groceries', amount: -68.70, type: 'expense', category: 'Food' },
  { id: 'j20', date: '2026-01-25', description: 'Cinema Tickets', amount: -24, type: 'expense', category: 'Entertainment' },
  { id: 'j21', date: '2026-01-26', description: 'Fuel Top-up', amount: -58, type: 'expense', category: 'Fuel' },
  { id: 'j22', date: '2026-01-28', description: 'Doctor Visit', amount: -30, type: 'expense', category: 'Health' },
  { id: 'j23', date: '2026-01-29', description: 'Work Lunch', amount: -28, type: 'expense', category: 'Restaurants' },
  { id: 'j24', date: '2026-01-30', description: 'Bank Interest', amount: 15.20, type: 'income', category: 'Interest' },
  { id: 'j25', date: '2026-01-31', description: 'Savings Transfer', amount: -300, type: 'expense', category: 'Savings' },

  // February 2026
  { id: 'f01', date: '2026-02-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'f02', date: '2026-02-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'f03', date: '2026-02-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'f04', date: '2026-02-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'f05', date: '2026-02-06', description: 'Lidl Groceries', amount: -79.20, type: 'expense', category: 'Food' },
  { id: 'f06', date: '2026-02-10', description: 'Car Insurance', amount: -95, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'f07', date: '2026-02-10', description: 'Health Insurance', amount: -55, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'f08', date: '2026-02-12', description: 'Valentine Dinner', amount: -95, type: 'expense', category: 'Restaurants' },
  { id: 'f09', date: '2026-02-13', description: 'Fuel Top-up', amount: -55, type: 'expense', category: 'Fuel' },
  { id: 'f10', date: '2026-02-15', description: 'Electricity Bill', amount: -71, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'f11', date: '2026-02-15', description: 'Gas Bill', amount: -48, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'f12', date: '2026-02-16', description: 'Tesco Groceries', amount: -65.80, type: 'expense', category: 'Food' },
  { id: 'f13', date: '2026-02-17', description: 'Monthly Bus Pass', amount: -45, type: 'expense', category: 'Transport', recurring: true },
  { id: 'f14', date: '2026-02-18', description: 'Coffee & Snacks', amount: -14.50, type: 'expense', category: 'Restaurants' },
  { id: 'f15', date: '2026-02-20', description: 'Internet Bill', amount: -35, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'f16', date: '2026-02-21', description: 'Clothes Shopping', amount: -145, type: 'expense', category: 'Shopping' },
  { id: 'f17', date: '2026-02-22', description: 'Phone Bill', amount: -45, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'f18', date: '2026-02-22', description: 'Gym Membership', amount: -35, type: 'expense', category: 'Health', recurring: true },
  { id: 'f19', date: '2026-02-24', description: 'Aldi Groceries', amount: -58.90, type: 'expense', category: 'Food' },
  { id: 'f20', date: '2026-02-25', description: 'Streaming Bundle', amount: -19.99, type: 'expense', category: 'Subscriptions' },
  { id: 'f21', date: '2026-02-26', description: 'Fuel Top-up', amount: -61, type: 'expense', category: 'Fuel' },
  { id: 'f22', date: '2026-02-28', description: 'Bank Interest', amount: 15.20, type: 'income', category: 'Interest' },
  { id: 'f23', date: '2026-02-28', description: 'Savings Transfer', amount: -300, type: 'expense', category: 'Savings' },

  // March 2026
  { id: 'm01', date: '2026-03-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'm02', date: '2026-03-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'm03', date: '2026-03-04', description: 'Freelance Project – Web Design', amount: 850, type: 'income', category: 'Freelance' },
  { id: 'm04', date: '2026-03-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'm05', date: '2026-03-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'm06', date: '2026-03-07', description: 'Lidl Groceries', amount: -92.60, type: 'expense', category: 'Food' },
  { id: 'm07', date: '2026-03-10', description: 'Car Insurance', amount: -95, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'm08', date: '2026-03-10', description: 'Health Insurance', amount: -55, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'm09', date: '2026-03-12', description: 'Restaurant with Friends', amount: -68, type: 'expense', category: 'Restaurants' },
  { id: 'm10', date: '2026-03-13', description: 'Fuel Top-up', amount: -70, type: 'expense', category: 'Fuel' },
  { id: 'm11', date: '2026-03-15', description: 'Electricity Bill', amount: -62, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'm12', date: '2026-03-15', description: 'Gas Bill', amount: -42, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'm13', date: '2026-03-16', description: 'Tesco Groceries', amount: -81.40, type: 'expense', category: 'Food' },
  { id: 'm14', date: '2026-03-17', description: 'Monthly Bus Pass', amount: -45, type: 'expense', category: 'Transport', recurring: true },
  { id: 'm15', date: '2026-03-20', description: 'Internet Bill', amount: -35, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'm16', date: '2026-03-21', description: 'Zara Shopping', amount: -120, type: 'expense', category: 'Shopping' },
  { id: 'm17', date: '2026-03-22', description: 'Phone Bill', amount: -45, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'm18', date: '2026-03-22', description: 'Gym Membership', amount: -35, type: 'expense', category: 'Health', recurring: true },
  { id: 'm19', date: '2026-03-24', description: 'Aldi Groceries', amount: -73.20, type: 'expense', category: 'Food' },
  { id: 'm20', date: '2026-03-25', description: 'Concert Tickets', amount: -85, type: 'expense', category: 'Entertainment' },
  { id: 'm21', date: '2026-03-26', description: 'Fuel Top-up', amount: -64, type: 'expense', category: 'Fuel' },
  { id: 'm22', date: '2026-03-28', description: 'Pharmacy', amount: -28.50, type: 'expense', category: 'Health' },
  { id: 'm23', date: '2026-03-29', description: 'Team Dinner', amount: -55, type: 'expense', category: 'Restaurants' },
  { id: 'm24', date: '2026-03-30', description: 'Bank Interest', amount: 15.20, type: 'income', category: 'Interest' },
  { id: 'm25', date: '2026-03-31', description: 'Savings Transfer', amount: -400, type: 'expense', category: 'Savings' },

  // April 2026
  { id: 'a01', date: '2026-04-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'a02', date: '2026-04-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'a03', date: '2026-04-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'a04', date: '2026-04-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'a05', date: '2026-04-07', description: 'Lidl Groceries', amount: -88.70, type: 'expense', category: 'Food' },
  { id: 'a06', date: '2026-04-10', description: 'Car Insurance', amount: -95, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'a07', date: '2026-04-10', description: 'Health Insurance', amount: -55, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'a08', date: '2026-04-13', description: 'Easter Weekend Restaurant', amount: -124, type: 'expense', category: 'Restaurants' },
  { id: 'a09', date: '2026-04-14', description: 'Fuel Top-up', amount: -75, type: 'expense', category: 'Fuel' },
  { id: 'a10', date: '2026-04-15', description: 'Electricity Bill', amount: -55, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'a11', date: '2026-04-15', description: 'Gas Bill', amount: -38, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'a12', date: '2026-04-16', description: 'Tesco Groceries', amount: -77.90, type: 'expense', category: 'Food' },
  { id: 'a13', date: '2026-04-17', description: 'Monthly Bus Pass', amount: -45, type: 'expense', category: 'Transport', recurring: true },
  { id: 'a14', date: '2026-04-18', description: 'City Break Flights', amount: -295, type: 'expense', category: 'Travel' },
  { id: 'a15', date: '2026-04-19', description: 'Hotel Dublin', amount: -180, type: 'expense', category: 'Travel' },
  { id: 'a16', date: '2026-04-20', description: 'Internet Bill', amount: -35, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'a17', date: '2026-04-22', description: 'Phone Bill', amount: -45, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'a18', date: '2026-04-22', description: 'Gym Membership', amount: -35, type: 'expense', category: 'Health', recurring: true },
  { id: 'a19', date: '2026-04-24', description: 'Aldi Groceries', amount: -62.80, type: 'expense', category: 'Food' },
  { id: 'a20', date: '2026-04-26', description: 'Fuel Top-up', amount: -68, type: 'expense', category: 'Fuel' },
  { id: 'a21', date: '2026-04-27', description: 'Online Course', amount: -149, type: 'expense', category: 'Education' },
  { id: 'a22', date: '2026-04-28', description: 'Tech Gadget', amount: -199, type: 'expense', category: 'Shopping' },
  { id: 'a23', date: '2026-04-29', description: 'Restaurant Birthday', amount: -72, type: 'expense', category: 'Restaurants' },
  { id: 'a24', date: '2026-04-30', description: 'Bank Interest', amount: 15.20, type: 'income', category: 'Interest' },
  { id: 'a25', date: '2026-04-30', description: 'Savings Transfer', amount: -200, type: 'expense', category: 'Savings' },

  // May 2026
  { id: 'my01', date: '2026-05-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'my02', date: '2026-05-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'my03', date: '2026-05-04', description: 'Freelance – App Development', amount: 1200, type: 'income', category: 'Freelance' },
  { id: 'my04', date: '2026-05-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'my05', date: '2026-05-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'my06', date: '2026-05-07', description: 'Lidl Groceries', amount: -84.20, type: 'expense', category: 'Food' },
  { id: 'my07', date: '2026-05-10', description: 'Car Insurance', amount: -95, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'my08', date: '2026-05-10', description: 'Health Insurance', amount: -55, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'my09', date: '2026-05-12', description: 'Restaurant Lunch', amount: -38, type: 'expense', category: 'Restaurants' },
  { id: 'my10', date: '2026-05-13', description: 'Fuel Top-up', amount: -66, type: 'expense', category: 'Fuel' },
  { id: 'my11', date: '2026-05-15', description: 'Electricity Bill', amount: -48, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'my12', date: '2026-05-15', description: 'Gas Bill', amount: -32, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'my13', date: '2026-05-16', description: 'Tesco Groceries', amount: -79.60, type: 'expense', category: 'Food' },
  { id: 'my14', date: '2026-05-17', description: 'Monthly Bus Pass', amount: -45, type: 'expense', category: 'Transport', recurring: true },
  { id: 'my15', date: '2026-05-20', description: 'Internet Bill', amount: -35, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'my16', date: '2026-05-21', description: 'Sports Equipment', amount: -155, type: 'expense', category: 'Shopping' },
  { id: 'my17', date: '2026-05-22', description: 'Phone Bill', amount: -45, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'my18', date: '2026-05-22', description: 'Gym Membership', amount: -35, type: 'expense', category: 'Health', recurring: true },
  { id: 'my19', date: '2026-05-24', description: 'Aldi Groceries', amount: -71.40, type: 'expense', category: 'Food' },
  { id: 'my20', date: '2026-05-25', description: 'BBQ Supplies', amount: -65, type: 'expense', category: 'Food' },
  { id: 'my21', date: '2026-05-26', description: 'Fuel Top-up', amount: -58, type: 'expense', category: 'Fuel' },
  { id: 'my22', date: '2026-05-28', description: 'Birthday Gift', amount: -85, type: 'expense', category: 'Miscellaneous' },
  { id: 'my23', date: '2026-05-29', description: 'Restaurant with Family', amount: -92, type: 'expense', category: 'Restaurants' },
  { id: 'my24', date: '2026-05-30', description: 'Bank Interest', amount: 15.20, type: 'income', category: 'Interest' },
  { id: 'my25', date: '2026-05-31', description: 'Savings Transfer', amount: -450, type: 'expense', category: 'Savings' },

  // June 2026
  { id: 'jn01', date: '2026-06-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'jn02', date: '2026-06-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'jn03', date: '2026-06-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'jn04', date: '2026-06-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'jn05', date: '2026-06-07', description: 'Lidl Groceries', amount: -91.80, type: 'expense', category: 'Food' },
  { id: 'jn06', date: '2026-06-10', description: 'Car Insurance', amount: -95, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'jn07', date: '2026-06-10', description: 'Health Insurance', amount: -55, type: 'expense', category: 'Insurance', recurring: true },
  { id: 'jn08', date: '2026-06-12', description: 'Restaurant Dinner', amount: -54, type: 'expense', category: 'Restaurants' },
  { id: 'jn09', date: '2026-06-13', description: 'Fuel Top-up', amount: -72, type: 'expense', category: 'Fuel' },
  { id: 'jn10', date: '2026-06-15', description: 'Electricity Bill', amount: -42, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'jn11', date: '2026-06-15', description: 'Gas Bill', amount: -28, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'jn12', date: '2026-06-16', description: 'Tesco Groceries', amount: -83.20, type: 'expense', category: 'Food' },
  { id: 'jn13', date: '2026-06-17', description: 'Monthly Bus Pass', amount: -45, type: 'expense', category: 'Transport', recurring: true },
  { id: 'jn14', date: '2026-06-18', description: 'Coffee & Pastry', amount: -18.50, type: 'expense', category: 'Restaurants' },
  { id: 'jn15', date: '2026-06-20', description: 'Internet Bill', amount: -35, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'jn16', date: '2026-06-21', description: 'Summer Clothes', amount: -178, type: 'expense', category: 'Shopping' },
  { id: 'jn17', date: '2026-06-22', description: 'Phone Bill', amount: -45, type: 'expense', category: 'Utilities', recurring: true },
  { id: 'jn18', date: '2026-06-22', description: 'Gym Membership', amount: -35, type: 'expense', category: 'Health', recurring: true },
  { id: 'jn19', date: '2026-06-24', description: 'Aldi Groceries', amount: -76.50, type: 'expense', category: 'Food' },
  { id: 'jn20', date: '2026-06-25', description: 'Summer Festival Tickets', amount: -120, type: 'expense', category: 'Entertainment' },
  { id: 'jn21', date: '2026-06-26', description: 'Fuel Top-up', amount: -66, type: 'expense', category: 'Fuel' },
  { id: 'jn22', date: '2026-06-27', description: 'Dentist', amount: -95, type: 'expense', category: 'Health' },
  { id: 'jn23', date: '2026-06-28', description: 'Restaurant Sunday', amount: -62, type: 'expense', category: 'Restaurants' },
  { id: 'jn24', date: '2026-06-30', description: 'Bank Interest', amount: 15.20, type: 'income', category: 'Interest' },
  { id: 'jn25', date: '2026-06-30', description: 'Savings Transfer', amount: -350, type: 'expense', category: 'Savings' },

  // July 2026 (current partial month)
  { id: 'jl01', date: '2026-07-01', description: 'Rent Payment', amount: -900, type: 'expense', category: 'Housing', recurring: true },
  { id: 'jl02', date: '2026-07-03', description: 'Monthly Salary', amount: 3500, type: 'income', category: 'Salary', recurring: true },
  { id: 'jl03', date: '2026-07-05', description: 'Netflix', amount: -15.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'jl04', date: '2026-07-05', description: 'Spotify', amount: -9.99, type: 'expense', category: 'Subscriptions', recurring: true },
  { id: 'jl05', date: '2026-07-06', description: 'Lidl Groceries', amount: -94.30, type: 'expense', category: 'Food' },
];

const BUDGETS: Budget[] = [
  { id: 'b1', category: 'Housing', budgeted: 950, month: '2026-07' },
  { id: 'b2', category: 'Utilities', budgeted: 200, month: '2026-07' },
  { id: 'b3', category: 'Food', budgeted: 400, month: '2026-07' },
  { id: 'b4', category: 'Transport', budgeted: 100, month: '2026-07' },
  { id: 'b5', category: 'Fuel', budgeted: 120, month: '2026-07' },
  { id: 'b6', category: 'Insurance', budgeted: 160, month: '2026-07' },
  { id: 'b7', category: 'Entertainment', budgeted: 100, month: '2026-07' },
  { id: 'b8', category: 'Restaurants', budgeted: 200, month: '2026-07' },
  { id: 'b9', category: 'Shopping', budgeted: 150, month: '2026-07' },
  { id: 'b10', category: 'Health', budgeted: 80, month: '2026-07' },
  { id: 'b11', category: 'Subscriptions', budgeted: 60, month: '2026-07' },
  { id: 'b12', category: 'Savings', budgeted: 400, month: '2026-07' },
  { id: 'b13', category: 'Miscellaneous', budgeted: 80, month: '2026-07' },
];

const SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'sg1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 6200, monthlyContribution: 300, icon: '🛡️', color: '#10B981', createdAt: '2025-01-01' },
  { id: 'sg2', name: 'Summer Holiday', targetAmount: 3000, currentAmount: 1450, monthlyContribution: 150, icon: '✈️', color: '#0EA5E9', createdAt: '2025-06-01' },
  { id: 'sg3', name: 'New Car', targetAmount: 15000, currentAmount: 3200, monthlyContribution: 200, icon: '🚗', color: '#A855F7', createdAt: '2025-03-01' },
  { id: 'sg4', name: 'House Deposit', targetAmount: 50000, currentAmount: 9800, monthlyContribution: 500, icon: '🏠', color: '#6366F1', createdAt: '2024-09-01' },
  { id: 'sg5', name: 'Gaming PC', targetAmount: 2500, currentAmount: 1100, monthlyContribution: 100, icon: '🖥️', color: '#F59E0B', createdAt: '2026-01-01' },
];

const BILLS: Bill[] = [
  { id: 'bill1', name: 'Rent', amount: 900, category: 'Housing', dueDay: 1, paid: true, recurring: true, icon: '🏠' },
  { id: 'bill2', name: 'Electricity', amount: 65, category: 'Utilities', dueDay: 15, paid: false, recurring: true, icon: '⚡' },
  { id: 'bill3', name: 'Gas', amount: 45, category: 'Utilities', dueDay: 15, paid: false, recurring: true, icon: '🔥' },
  { id: 'bill4', name: 'Internet', amount: 35, category: 'Utilities', dueDay: 20, paid: false, recurring: true, icon: '📡' },
  { id: 'bill5', name: 'Phone', amount: 45, category: 'Utilities', dueDay: 22, paid: false, recurring: true, icon: '📱' },
  { id: 'bill6', name: 'Netflix', amount: 15.99, category: 'Subscriptions', dueDay: 5, paid: true, recurring: true, icon: '🎬' },
  { id: 'bill7', name: 'Spotify', amount: 9.99, category: 'Subscriptions', dueDay: 5, paid: true, recurring: true, icon: '🎵' },
  { id: 'bill8', name: 'Gym', amount: 35, category: 'Health', dueDay: 22, paid: false, recurring: true, icon: '💪' },
  { id: 'bill9', name: 'Car Insurance', amount: 95, category: 'Insurance', dueDay: 10, paid: false, recurring: true, icon: '🚗' },
  { id: 'bill10', name: 'Health Insurance', amount: 55, category: 'Insurance', dueDay: 10, paid: false, recurring: true, icon: '❤️' },
];

const SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', name: 'Netflix', category: 'Streaming', amount: 15.99, renewal: '2026-08-05', used: true, icon: '🎬', color: '#E50914' },
  { id: 's2', name: 'Spotify', category: 'Music', amount: 9.99, renewal: '2026-08-05', used: true, icon: '🎵', color: '#1DB954' },
  { id: 's3', name: 'Streaming Bundle', category: 'Streaming', amount: 19.99, renewal: '2026-08-25', used: false, icon: '📺', color: '#0078D4' },
  { id: 's4', name: 'iCloud Storage', category: 'Cloud', amount: 2.99, renewal: '2026-08-12', used: true, icon: '☁️', color: '#3B82F6' },
  { id: 's5', name: 'Adobe Creative', category: 'Software', amount: 59.99, renewal: '2026-08-18', used: true, icon: '🎨', color: '#FF0000' },
  { id: 's6', name: 'GitHub Pro', category: 'Developer', amount: 3.67, renewal: '2026-08-20', used: true, icon: '💻', color: '#6366F1' },
  { id: 's7', name: 'Notion', category: 'Productivity', amount: 8, renewal: '2026-08-10', used: false, icon: '📝', color: '#8B5CF6' },
  { id: 's8', name: 'ChatGPT Plus', category: 'AI', amount: 18.84, renewal: '2026-08-03', used: true, icon: '🤖', color: '#10B981' },
];

const NET_WORTH_ITEMS: NetWorthItem[] = [
  { id: 'nw1', name: 'Current Account', category: 'Cash', itemType: 'asset', amount: 3200 },
  { id: 'nw2', name: 'Savings Account', category: 'Savings', itemType: 'asset', amount: 21750 },
  { id: 'nw3', name: 'Investment Portfolio', category: 'Investments', itemType: 'asset', amount: 14800 },
  { id: 'nw4', name: 'Car (Market Value)', category: 'Property', itemType: 'asset', amount: 8500 },
  { id: 'nw5', name: 'Laptop & Electronics', category: 'Other', itemType: 'asset', amount: 2200 },
  { id: 'nw6', name: 'Car Loan', category: 'Loans', itemType: 'liability', amount: 4800 },
  { id: 'nw7', name: 'Student Loan', category: 'Loans', itemType: 'liability', amount: 7200 },
  { id: 'nw8', name: 'Credit Card Balance', category: 'Credit', itemType: 'liability', amount: 420 },
];

export const useStore = create<AppState>((set) => ({
  transactions: TRANSACTIONS,
  budgets: BUDGETS,
  savingsGoals: SAVINGS_GOALS,
  bills: BILLS,
  subscriptions: SUBSCRIPTIONS,
  netWorthItems: NET_WORTH_ITEMS,
  chatMessages: [],
  dismissedNotifications: [],
  darkMode: true,
  currentMonth: '2026-07',

  addTransaction: (t) => set(s => ({ transactions: [t, ...s.transactions] })),
  updateTransaction: (id, t) => set(s => ({
    transactions: s.transactions.map(tx => tx.id === id ? { ...tx, ...t } : tx)
  })),
  deleteTransaction: (id) => set(s => ({
    transactions: s.transactions.filter(tx => tx.id !== id)
  })),

  updateBudget: (id, budgeted) => set(s => ({
    budgets: s.budgets.map(b => b.id === id ? { ...b, budgeted } : b)
  })),

  addSavingsGoal: (g) => set(s => ({ savingsGoals: [...s.savingsGoals, g] })),
  updateSavingsGoal: (id, g) => set(s => ({
    savingsGoals: s.savingsGoals.map(sg => sg.id === id ? { ...sg, ...g } : sg)
  })),
  deleteSavingsGoal: (id) => set(s => ({
    savingsGoals: s.savingsGoals.filter(sg => sg.id !== id)
  })),

  addBill: (b) => set(s => ({ bills: [...s.bills, b] })),
  updateBill: (id, b) => set(s => ({ bills: s.bills.map(x => x.id === id ? { ...x, ...b } : x) })),
  deleteBill: (id) => set(s => ({ bills: s.bills.filter(b => b.id !== id) })),
  updateBillPaid: (id, paid) => set(s => ({
    bills: s.bills.map(b => b.id === id ? { ...b, paid } : b)
  })),

  addSubscription: (sub) => set(s => ({ subscriptions: [...s.subscriptions, sub] })),
  updateSubscription: (id, sub) => set(s => ({ subscriptions: s.subscriptions.map(x => x.id === id ? { ...x, ...sub } : x) })),
  deleteSubscription: (id) => set(s => ({ subscriptions: s.subscriptions.filter(x => x.id !== id) })),

  addNetWorthItem: (item) => set(s => ({ netWorthItems: [...s.netWorthItems, item] })),
  updateNetWorthItem: (id, item) => set(s => ({
    netWorthItems: s.netWorthItems.map(n => n.id === id ? { ...n, ...item } : n)
  })),
  deleteNetWorthItem: (id) => set(s => ({
    netWorthItems: s.netWorthItems.filter(n => n.id !== id)
  })),

  addChatMessage: (msg) => set(s => ({ chatMessages: [...s.chatMessages, msg] })),
  dismissNotification: (id) => set(s => ({ dismissedNotifications: [...s.dismissedNotifications, id] })),
  toggleDarkMode: () => set(s => ({ darkMode: !s.darkMode })),
  setCurrentMonth: (month) => set({ currentMonth: month }),
}));
