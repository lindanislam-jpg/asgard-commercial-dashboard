import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

function generateForecast(baseBalance: number, monthlyIncome: number, monthlyExpenses: number, months: number) {
  const data = [];
  let balance = baseBalance;
  const variance = [0.95, 1.02, 0.98, 1.05, 0.97, 1.03, 0.96, 1.01, 0.99, 1.04, 0.98, 1.02];

  for (let i = 0; i < months; i++) {
    const date = new Date(2026, 6 + i); // July 2026 onwards
    const income = monthlyIncome * (variance[i % 12]);
    const expenses = monthlyExpenses * (variance[(i + 3) % 12]);
    balance = balance + income - expenses;

    data.push({
      month: date.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' }),
      balance: Math.round(balance),
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(income - expenses),
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A2E] border border-[#2D2D50] rounded-xl p-3 shadow-2xl min-w-[160px]">
        <p className="text-slate-400 text-xs mb-2 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex justify-between gap-4 text-xs">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="text-slate-200 font-semibold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CashFlow() {
  const { transactions } = useStore();

  const { monthlyIncome, monthlyExpenses, currentBalance } = useMemo(() => {
    const months = ['2026-04', '2026-05', '2026-06'];
    const avgIncome = months.reduce((s, m) => s + transactions.filter(t => t.type === 'income' && t.date.startsWith(m)).reduce((ss, t) => ss + t.amount, 0), 0) / 3;
    const avgExpenses = months.reduce((s, m) => s + Math.abs(transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((ss, t) => ss + t.amount, 0)), 0) / 3;
    return { monthlyIncome: avgIncome, monthlyExpenses: avgExpenses, currentBalance: 3200 };
  }, [transactions]);

  const forecast12 = useMemo(() => generateForecast(currentBalance, monthlyIncome, monthlyExpenses, 12), [currentBalance, monthlyIncome, monthlyExpenses]);
  const forecast6 = forecast12.slice(0, 6);
  const forecast3 = forecast12.slice(0, 3);

  const projectedSavings12 = forecast12[11].balance - currentBalance;
  const lowestBalance = Math.min(...forecast12.map(d => d.balance));
  const riskLevel = lowestBalance < 500 ? 'high' : lowestBalance < 1500 ? 'medium' : 'low';

  const scenarios = [
    { label: 'Next 3 months', data: forecast3, color: '#06B6D4' },
    { label: 'Next 6 months', data: forecast6, color: '#A855F7' },
    { label: 'Next 12 months', data: forecast12, color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cash Flow Forecast</h1>
        <p className="text-slate-400 text-sm mt-0.5">Projected finances based on your spending patterns</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Current Balance</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(currentBalance)}</div>
          <div className="text-xs text-slate-500 mt-0.5">Cash available now</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Monthly Avg Income</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(monthlyIncome)}</div>
          <div className="text-xs text-slate-500 mt-0.5">3-month average</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Monthly Avg Spend</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(monthlyExpenses)}</div>
          <div className="text-xs text-slate-500 mt-0.5">3-month average</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Projected Savings</div>
          <div className={`text-2xl font-bold mt-1 ${projectedSavings12 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {projectedSavings12 >= 0 ? '+' : ''}{formatCurrency(projectedSavings12)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Over 12 months</div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className={`card p-4 flex items-center gap-3 ${
        riskLevel === 'high' ? 'border-rose-500/30 bg-rose-500/5' :
        riskLevel === 'medium' ? 'border-amber-500/30 bg-amber-500/5' :
        'border-emerald-500/30 bg-emerald-500/5'
      }`}>
        {riskLevel === 'high' ? <AlertTriangle size={20} className="text-rose-400 flex-shrink-0" /> :
         riskLevel === 'medium' ? <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" /> :
         <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />}
        <div>
          <div className={`font-semibold text-sm ${riskLevel === 'high' ? 'text-rose-300' : riskLevel === 'medium' ? 'text-amber-300' : 'text-emerald-300'}`}>
            Cash Flow Risk: {riskLevel === 'high' ? 'High' : riskLevel === 'medium' ? 'Medium' : 'Low'}
          </div>
          <div className="text-slate-400 text-xs mt-0.5">
            {riskLevel === 'low'
              ? `Your lowest projected balance is ${formatCurrency(lowestBalance)}, well above the danger zone. You're in great financial shape.`
              : riskLevel === 'medium'
              ? `Your balance may drop to ${formatCurrency(lowestBalance)} at some point. Consider building up your buffer.`
              : `Caution: your balance could fall to ${formatCurrency(lowestBalance)}. Review your spending urgently.`}
          </div>
        </div>
      </div>

      {/* 12-month forecast chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">12-Month Balance Projection</h2>
          <div className="badge-purple">Based on avg income & expenses</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={forecast12}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="balance" name="Balance" stroke="#7C3AED" fill="url(#balanceGrad)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Income vs Expenses forecast */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">Monthly Income vs Expenses Forecast</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={forecast12}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#incGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F43F5E" fill="url(#expGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly breakdown table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#1E2038]">
          <h2 className="text-white font-semibold">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-[#1E2038]">
                <th className="text-left px-4 py-3">Month</th>
                <th className="text-right px-4 py-3">Income</th>
                <th className="text-right px-4 py-3">Expenses</th>
                <th className="text-right px-4 py-3">Net</th>
                <th className="text-right px-4 py-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {forecast12.map((row, i) => (
                <tr key={i} className="border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-300">{row.month}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400 text-right font-medium">{formatCurrency(row.income)}</td>
                  <td className="px-4 py-3 text-sm text-rose-400 text-right font-medium">{formatCurrency(row.expenses)}</td>
                  <td className={`px-4 py-3 text-sm text-right font-semibold ${row.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-200 text-right font-semibold">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
