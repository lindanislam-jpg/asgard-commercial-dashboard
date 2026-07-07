import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Shield,
  Zap, AlertCircle, ArrowUpRight, ArrowDownRight, Brain
} from 'lucide-react';
import { useStore } from '../store';
import {
  formatCurrency, formatCompact, getMonthlyIncome, getMonthlyExpenses,
  getExpensesByCategory, CATEGORY_COLORS, formatShortDate
} from '../utils';

const MONTHS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A2E] border border-[#2D2D50] rounded-xl p-3 shadow-2xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function HealthScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Excellent' : score >= 55 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#1E2038" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className="mt-1 text-sm font-semibold" style={{ color }}>
        {label}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">Financial Health</div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  color: string;
  sub?: string;
}

function MetricCard({ label, value, icon, change, color, sub }: MetricCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-3 card-hover cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(change).toFixed(1)}% vs last month
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { transactions, savingsGoals, bills, netWorthItems } = useStore();

  const stats = useMemo(() => {
    const thisMonth = '2026-07';
    const lastMonth = '2026-06';

    const income = getMonthlyIncome(transactions, thisMonth);
    const expenses = getMonthlyExpenses(transactions, thisMonth);
    const lastIncome = getMonthlyIncome(transactions, lastMonth);
    const lastExpenses = getMonthlyExpenses(transactions, lastMonth);

    const savings = transactions
      .filter(t => t.type === 'expense' && t.category === 'Savings')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalAssets = netWorthItems.filter(n => n.itemType === 'asset').reduce((s, n) => s + n.amount, 0);
    const totalLiabilities = netWorthItems.filter(n => n.itemType === 'liability').reduce((s, n) => s + n.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const emergencyGoal = savingsGoals.find(g => g.name === 'Emergency Fund');
    const efProgress = emergencyGoal ? (emergencyGoal.currentAmount / emergencyGoal.targetAmount) * 100 : 0;
    const efMonths = expenses > 0 ? (emergencyGoal?.currentAmount || 0) / (expenses || 1) : 0;

    const totalBudget = 2300;
    const budgetRemaining = totalBudget - expenses;
    const budgetUsed = (expenses / totalBudget) * 100;

    const totalSavings = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
    const cashAvailable = 3200;

    const incomeChange = lastIncome > 0 ? ((income - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((expenses - lastExpenses) / lastExpenses) * 100 : 0;

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    const efScore = Math.min((efMonths / 6) * 25, 25);
    const savingsScore = Math.min(savingsRate * 0.83, 25);
    const budgetScore = budgetUsed <= 100 ? 25 : Math.max(0, 25 - (budgetUsed - 100) * 0.5);
    const growthScore = netWorth > 30000 ? 25 : (netWorth / 30000) * 25;
    const healthScore = Math.round(efScore + savingsScore + budgetScore + growthScore);

    return {
      income, expenses, lastIncome, lastExpenses, savings, netWorth,
      efProgress, efMonths, budgetRemaining, budgetUsed, totalSavings,
      cashAvailable, incomeChange, expenseChange, healthScore,
    };
  }, [transactions, savingsGoals, netWorthItems]);

  const chartData = useMemo(() =>
    MONTHS.map((m, i) => ({
      month: MONTH_LABELS[i],
      income: getMonthlyIncome(transactions, m),
      expenses: getMonthlyExpenses(transactions, m),
    })),
    [transactions]
  );

  const categoryData = useMemo(() => {
    const byCategory = getExpensesByCategory(transactions, '2026-07');
    return Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#94A3B8' }));
  }, [transactions]);

  const recentTransactions = useMemo(() =>
    [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8),
    [transactions]
  );

  const upcomingBills = useMemo(() =>
    bills
      .filter(b => !b.paid)
      .sort((a, b) => a.dueDay - b.dueDay)
      .slice(0, 4),
    [bills]
  );

  const AI_INSIGHT = "You're on track this month — spending is €94 lower than July's budget. Your restaurant spending has risen 22% over 3 months; skipping two takeaways per week could save you €1,150/year. Consider moving the extra savings into your House Deposit goal — you'd reach it 4 months sooner.";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your financial overview for July 2026</p>
      </div>

      {/* AI Insight Banner */}
      <div className="card p-4 bg-gradient-to-r from-violet-900/30 to-purple-900/20 border-violet-500/20">
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain size={17} className="text-violet-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">AI Daily Insight</div>
            <p className="text-slate-200 text-sm leading-relaxed">{AI_INSIGHT}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards — Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Cash Available"
          value={formatCurrency(stats.cashAvailable)}
          icon={<Wallet size={18} />}
          color="#10B981"
          sub="Current account"
        />
        <MetricCard
          label="Monthly Income"
          value={formatCurrency(stats.income)}
          icon={<TrendingUp size={18} />}
          change={stats.incomeChange}
          color="#A855F7"
          sub="July 2026"
        />
        <MetricCard
          label="Monthly Spending"
          value={formatCurrency(stats.expenses)}
          icon={<TrendingDown size={18} />}
          change={stats.expenseChange}
          color="#F43F5E"
          sub="July 2026"
        />
        <MetricCard
          label="Remaining Budget"
          value={formatCurrency(Math.max(stats.budgetRemaining, 0))}
          icon={<PiggyBank size={18} />}
          color={stats.budgetUsed > 100 ? '#EF4444' : stats.budgetUsed > 80 ? '#F59E0B' : '#10B981'}
          sub={`${stats.budgetUsed.toFixed(0)}% of budget used`}
        />
      </div>

      {/* Metric Cards — Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Savings"
          value={formatCurrency(stats.totalSavings)}
          icon={<Target size={18} />}
          color="#06B6D4"
          sub={`${savingsGoals.length} active goals`}
        />
        <MetricCard
          label="Net Worth"
          value={formatCompact(stats.netWorth >= 0 ? stats.netWorth : 0)}
          icon={<BarChartIcon />}
          color="#6366F1"
          sub="Assets minus liabilities"
        />
        <MetricCard
          label="Emergency Fund"
          value={`${stats.efMonths.toFixed(1)} months`}
          icon={<Shield size={18} />}
          color={stats.efMonths >= 6 ? '#10B981' : stats.efMonths >= 3 ? '#F59E0B' : '#EF4444'}
          sub={`${stats.efProgress.toFixed(0)}% of target`}
        />
        <MetricCard
          label="Savings This Month"
          value={formatCurrency(stats.savings)}
          icon={<Zap size={18} />}
          color="#F59E0B"
          sub={`${stats.income > 0 ? ((stats.savings / stats.income) * 100).toFixed(0) : 0}% of income`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expenses chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white font-semibold">Income vs Expenses</h2>
              <p className="text-slate-400 text-xs mt-0.5">Last 7 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => `€${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" name="Income" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by category */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-1">Spending Breakdown</h2>
          <p className="text-slate-400 text-xs mb-4">July 2026</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                dataKey="value" paddingAngle={2}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 4).map(cat => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                <span className="text-slate-400 flex-1">{cat.name}</span>
                <span className="text-slate-200 font-medium">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Score + Upcoming Bills + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health score */}
        <div className="card p-5 flex flex-col items-center justify-center gap-4">
          <HealthScoreRing score={stats.healthScore} />
          <div className="w-full space-y-2">
            {[
              { label: 'Savings Rate', value: stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0, max: 20 },
              { label: 'Emergency Fund', value: stats.efMonths, max: 6 },
              { label: 'Budget Control', value: 100 - Math.max(0, stats.budgetUsed - 100), max: 100 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{item.label}</span>
                  <span className="text-slate-200">{item.value.toFixed(1)}{item.label.includes('Fund') ? 'mo' : '%'}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill bg-gradient-to-r from-violet-600 to-purple-500"
                    style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming bills */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Upcoming Bills</h2>
            <span className="badge-red">{upcomingBills.length} due</span>
          </div>
          <div className="space-y-3">
            {upcomingBills.map(bill => (
              <div key={bill.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1C1C30] border border-[#2D2D50] flex items-center justify-center text-base">
                  {bill.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">{bill.name}</div>
                  <div className="text-xs text-slate-500">Due {bill.dueDay}th July</div>
                </div>
                <div className="text-sm font-semibold text-rose-400">{formatCurrency(bill.amount)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#1E2038]">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total remaining</span>
              <span className="font-bold text-rose-400">
                {formatCurrency(upcomingBills.reduce((s, b) => s + b.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Savings goals progress */}
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">Savings Goals</h2>
          <div className="space-y-4">
            {savingsGoals.slice(0, 4).map(goal => {
              const pct = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{goal.icon}</span>
                    <span className="text-sm font-medium text-slate-200 flex-1">{goal.name}</span>
                    <span className="text-xs text-slate-400">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(pct, 100)}%`, background: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">{formatCompact(goal.currentAmount)}</span>
                    <span className="text-xs text-slate-500">{formatCompact(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Transactions</h2>
          <a href="#/expenses" className="text-xs text-violet-400 hover:text-violet-300 font-medium">View all →</a>
        </div>
        <div className="space-y-2">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-[#1E2038] last:border-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${CATEGORY_COLORS[tx.category] || '#94A3B8'}15`, border: `1px solid ${CATEGORY_COLORS[tx.category] || '#94A3B8'}25` }}>
                <span className="text-sm">{getCategoryEmoji(tx.category)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{tx.description}</div>
                <div className="text-xs text-slate-500">{formatShortDate(tx.date)} · {tx.category}</div>
              </div>
              <div className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Housing: '🏠', Utilities: '⚡', Food: '🛒', Transport: '🚌', Fuel: '⛽',
    Insurance: '🛡️', Entertainment: '🎭', Restaurants: '🍽️', Shopping: '🛍️',
    Health: '❤️', Education: '📚', Travel: '✈️', Subscriptions: '📺',
    Investments: '📈', Savings: '💰', Miscellaneous: '📦',
    Salary: '💼', Freelance: '💻', 'Side Hustle': '🚀', Gift: '🎁',
    Interest: '🏦', Refund: '↩️', 'Investment Return': '📈', Other: '📌',
  };
  return map[category] || '💳';
}
