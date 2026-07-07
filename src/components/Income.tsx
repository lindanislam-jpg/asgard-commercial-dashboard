import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Plus, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, getMonthlyIncome, getIncomeByCategory, CATEGORY_COLORS, formatDate, INCOME_CATEGORIES } from '../utils';

const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
const LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

export default function Income() {
  const { transactions, addTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', description: '', amount: '', category: 'Salary', notes: '' });

  const incomeTransactions = useMemo(() =>
    transactions.filter(t => t.type === 'income').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions]
  );

  const monthlyData = useMemo(() =>
    MONTHS.map((m, i) => ({
      month: LABELS[i],
      income: getMonthlyIncome(transactions, m),
    })),
    [transactions]
  );

  const thisMonth = '2026-07';
  const lastMonth = '2026-06';
  const thisIncome = getMonthlyIncome(transactions, thisMonth);
  const lastIncome = getMonthlyIncome(transactions, lastMonth);
  const avgIncome = monthlyData.reduce((s, d) => s + d.income, 0) / monthlyData.filter(d => d.income > 0).length;
  const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
  const change = lastIncome > 0 ? ((thisIncome - lastIncome) / lastIncome) * 100 : 0;

  const categoryData = useMemo(() => {
    const by = getIncomeByCategory(transactions);
    return Object.entries(by).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#94A3B8' }));
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.description || !form.amount) return;
    addTransaction({
      id: `inc_${Date.now()}`,
      date: form.date,
      description: form.description,
      amount: parseFloat(form.amount),
      type: 'income',
      category: form.category,
      notes: form.notes,
    });
    setForm({ date: '', description: '', amount: '', category: 'Salary', notes: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Income Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track all your income sources</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Income
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'This Month', value: formatCurrency(thisIncome), sub: `${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs last month`, color: '#A855F7' },
          { label: 'Last Month', value: formatCurrency(lastIncome), sub: 'June 2026', color: '#6366F1' },
          { label: 'Monthly Average', value: formatCurrency(avgIncome), sub: 'Last 7 months', color: '#10B981' },
          { label: 'Total YTD', value: formatCurrency(totalIncome), sub: '2026 to date', color: '#06B6D4' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-slate-400 text-sm">{s.label}</div>
            <div className="text-2xl font-bold text-white mt-1">{s.value}</div>
            <div className={`text-xs mt-1 ${s.label === 'This Month' && change >= 0 ? 'text-emerald-400' : s.label === 'This Month' && change < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Monthly Income Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
              <Bar dataKey="income" name="Income" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">By Source</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={3}>
                {categoryData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-slate-400 flex-1">{c.name}</span>
                <span className="text-slate-200 font-medium">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">All Income Transactions</h2>
        <div className="space-y-2">
          {incomeTransactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[#1C1C30] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={15} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{tx.description}</div>
                <div className="text-xs text-slate-500">{formatDate(tx.date)} · {tx.category}</div>
              </div>
              <div className="text-sm font-bold text-emerald-400">{formatCurrency(tx.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Income Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content">
            <h2 className="text-lg font-bold text-white mb-4">Add Income</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="e.g. Monthly Salary" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (€)</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Income</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
