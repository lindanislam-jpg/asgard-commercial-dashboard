import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { NetWorthItem } from '../types';

const ASSET_CATEGORIES = ['Cash', 'Savings', 'Investments', 'Property', 'Vehicle', 'Other'];
const LIABILITY_CATEGORIES = ['Mortgage', 'Car Loan', 'Student Loan', 'Credit Card', 'Personal Loan', 'Other'];

const ASSET_COLORS = ['#10B981', '#06B6D4', '#6366F1', '#A855F7', '#F59E0B', '#94A3B8'];
const LIABILITY_COLORS = ['#EF4444', '#F97316', '#F43F5E', '#E11D48', '#DC2626', '#94A3B8'];

const HISTORY = [
  { month: 'Jan', netWorth: 28400 },
  { month: 'Feb', netWorth: 29100 },
  { month: 'Mar', netWorth: 30500 },
  { month: 'Apr', netWorth: 29800 },
  { month: 'May', netWorth: 31200 },
  { month: 'Jun', netWorth: 32800 },
  { month: 'Jul', netWorth: 34030 },
];

export default function NetWorth() {
  const { netWorthItems, addNetWorthItem, updateNetWorthItem, deleteNetWorthItem } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NetWorthItem | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Cash', itemType: 'asset' as 'asset' | 'liability', amount: '' });

  const assets = netWorthItems.filter(n => n.itemType === 'asset');
  const liabilities = netWorthItems.filter(n => n.itemType === 'liability');
  const totalAssets = assets.reduce((s, n) => s + n.amount, 0);
  const totalLiabilities = liabilities.reduce((s, n) => s + n.amount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const prevNetWorth = HISTORY[HISTORY.length - 2].netWorth;
  const change = netWorth - prevNetWorth;
  const changePct = prevNetWorth > 0 ? (change / prevNetWorth) * 100 : 0;

  const barData = [
    { name: 'Assets', value: totalAssets, fill: '#10B981' },
    { name: 'Liabilities', value: totalLiabilities, fill: '#EF4444' },
    { name: 'Net Worth', value: netWorth, fill: '#7C3AED' },
  ];

  const assetPie = assets.map((a, i) => ({ ...a, color: ASSET_COLORS[i % ASSET_COLORS.length] }));
  const liabilityPie = liabilities.map((a, i) => ({ ...a, color: LIABILITY_COLORS[i % LIABILITY_COLORS.length] }));

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', category: 'Cash', itemType: 'asset', amount: '' });
    setShowForm(true);
  };

  const openEdit = (item: NetWorthItem) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, itemType: item.itemType, amount: String(item.amount) });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, category: form.category, itemType: form.itemType, amount: parseFloat(form.amount) };
    if (editItem) updateNetWorthItem(editItem.id, data);
    else addNetWorthItem({ ...data, id: `nw_${Date.now()}` });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Net Worth Tracker</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your financial position at a glance</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Net Worth headline */}
      <div className="card p-6 bg-gradient-to-r from-violet-900/30 to-indigo-900/20 border-violet-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-slate-400 text-sm">Total Net Worth</div>
            <div className="text-4xl font-bold text-white mt-1">{formatCurrency(netWorth)}</div>
          </div>
          <div className={`flex items-center gap-2 text-lg font-bold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <TrendingUp size={20} />
            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(1)}%) this month
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-[#0A0A14]/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Assets</div>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalAssets)}</div>
          </div>
          <div className="bg-[#0A0A14]/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Liabilities</div>
            <div className="text-2xl font-bold text-rose-400">{formatCurrency(totalLiabilities)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">Net Worth Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
              <Bar dataKey="netWorth" name="Net Worth" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">Assets vs Liabilities</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} width={70} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
              <Bar dataKey="value" name="Amount" radius={[0, 6, 6, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets & Liabilities tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[#1E2038] flex items-center justify-between">
            <h2 className="text-white font-semibold">Assets</h2>
            <span className="text-emerald-400 font-bold text-sm">{formatCurrency(totalAssets)}</span>
          </div>
          {assetPie.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors group">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{item.name}</div>
                <div className="text-xs text-slate-500">{item.category}</div>
              </div>
              <div className="text-sm font-semibold text-emerald-400 mr-2">{formatCurrency(item.amount)}</div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="text-slate-600 hover:text-violet-400 p-1"><Pencil size={12} /></button>
                <button onClick={() => deleteNetWorthItem(item.id)} className="text-slate-600 hover:text-rose-400 p-1"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Liabilities */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[#1E2038] flex items-center justify-between">
            <h2 className="text-white font-semibold">Liabilities</h2>
            <span className="text-rose-400 font-bold text-sm">{formatCurrency(totalLiabilities)}</span>
          </div>
          {liabilityPie.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors group">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{item.name}</div>
                <div className="text-xs text-slate-500">{item.category}</div>
              </div>
              <div className="text-sm font-semibold text-rose-400 mr-2">{formatCurrency(item.amount)}</div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="text-slate-600 hover:text-violet-400 p-1"><Pencil size={12} /></button>
                <button onClick={() => deleteNetWorthItem(item.id)} className="text-slate-600 hover:text-rose-400 p-1"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content">
            <h2 className="text-lg font-bold text-white mb-4">{editItem ? 'Edit Item' : 'Add Net Worth Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input className="input" placeholder="e.g. Savings Account" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Type</label>
                <div className="flex gap-3">
                  {(['asset', 'liability'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setForm(p => ({ ...p, itemType: t, category: t === 'asset' ? 'Cash' : 'Car Loan' }))}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${form.itemType === t ? (t === 'asset' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300') : 'bg-[#1C1C30] border-[#2D2D50] text-slate-400'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {(form.itemType === 'asset' ? ASSET_CATEGORIES : LIABILITY_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (€)</label>
                <input className="input" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
