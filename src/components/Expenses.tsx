import { useMemo, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Plus, Search, Trash2, TrendingDown, Upload, X, CheckCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, formatDate, CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../utils';
import { Transaction } from '../types';

const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
const LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

export default function Expenses() {
  const { transactions, addTransaction, deleteTransaction } = useStore();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<Transaction[]>([]);
  const [importError, setImportError] = useState('');
  const [importDone, setImportDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ date: '', description: '', amount: '', category: 'Food', notes: '', recurring: false });

  const expenseTransactions = useMemo(() =>
    transactions.filter(t => t.type === 'expense')
      .filter(t => filterCat === 'All' || t.category === filterCat)
      .filter(t => t.description.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, search, filterCat]
  );

  const monthlyData = useMemo(() =>
    MONTHS.map((m, i) => ({
      month: LABELS[i],
      expenses: Math.abs(transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0)),
    })),
    [transactions]
  );

  const categoryTotals = useMemo(() => {
    const byCategory: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#94A3B8' }));
  }, [transactions]);

  const total = expenseTransactions.reduce((s, t) => s + Math.abs(t.amount), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.description || !form.amount) return;
    addTransaction({
      id: `exp_${Date.now()}`,
      date: form.date,
      description: form.description,
      amount: -Math.abs(parseFloat(form.amount)),
      type: 'expense',
      category: form.category,
      notes: form.notes,
      recurring: form.recurring,
    });
    setForm({ date: '', description: '', amount: '', category: 'Food', notes: '', recurring: false });
    setShowForm(false);
  };

  const parseCSV = (text: string) => {
    setImportError('');
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { setImportError('CSV must have a header row and at least one data row.'); return; }
    const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/"/g, '').trim());
    const dateIdx = headers.findIndex(h => h === 'date');
    const descIdx = headers.findIndex(h => h.includes('desc') || h === 'name' || h === 'payee');
    const amtIdx = headers.findIndex(h => h.includes('amount') || h === 'amt' || h === 'value');
    const catIdx = headers.findIndex(h => h.includes('cat') || h === 'type');
    if (dateIdx === -1 || amtIdx === -1) {
      setImportError('CSV must have "Date" and "Amount" columns at minimum.'); return;
    }
    const parsed: Transaction[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
      const rawAmt = parseFloat(cols[amtIdx]?.replace(/[^0-9.-]/g, '') || '0');
      if (isNaN(rawAmt) || rawAmt === 0) continue;
      const amount = -Math.abs(rawAmt);
      parsed.push({
        id: `csv_${Date.now()}_${i}`,
        date: cols[dateIdx] || '',
        description: descIdx >= 0 ? cols[descIdx] : `Import row ${i}`,
        amount,
        type: 'expense',
        category: catIdx >= 0 && EXPENSE_CATEGORIES.includes(cols[catIdx]) ? cols[catIdx] : 'Miscellaneous',
      });
    }
    if (parsed.length === 0) { setImportError('No valid rows found in the CSV.'); return; }
    setImportPreview(parsed);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => parseCSV(ev.target?.result as string);
    reader.readAsText(file);
  };

  const confirmImport = () => {
    importPreview.forEach(t => addTransaction(t));
    setImportPreview([]);
    setImportDone(true);
    setTimeout(() => { setShowImport(false); setImportDone(false); if (fileRef.current) fileRef.current.value = ''; }, 1500);
  };

  const topCategories = ['All', ...EXPENSE_CATEGORIES.slice(0, 8)];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expense Tracker</h1>
          <p className="text-slate-400 text-sm mt-0.5">{expenseTransactions.length} transactions · {formatCurrency(total)} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Upload size={14} /> Import CSV
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Monthly Expenses</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
              <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryTotals.slice(0, 8)} cx="50%" cy="50%" innerRadius={38} outerRadius={68} dataKey="value" paddingAngle={2}>
                {categoryTotals.slice(0, 8).map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {categoryTotals.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-slate-400 flex-1 truncate">{c.name}</span>
                <span className="text-slate-200 font-medium">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {topCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                filterCat === cat
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-[#1C1C30] border-[#2D2D50] text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#1E2038]">
          <h2 className="text-white font-semibold">Transactions</h2>
        </div>
        <div>
          {expenseTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No transactions found</div>
          ) : (
            expenseTransactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors group">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${CATEGORY_COLORS[tx.category] || '#94A3B8'}15`, border: `1px solid ${CATEGORY_COLORS[tx.category] || '#94A3B8'}25` }}>
                  <TrendingDown size={14} style={{ color: CATEGORY_COLORS[tx.category] || '#94A3B8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200">{tx.description}</div>
                  <div className="text-xs text-slate-500">{formatDate(tx.date)} · {tx.category}{tx.recurring ? ' · 🔄 Recurring' : ''}</div>
                </div>
                <div className="text-sm font-semibold text-rose-400 mr-2">{formatCurrency(Math.abs(tx.amount))}</div>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImport && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowImport(false)}>
          <div className="modal-content max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Import Transactions (CSV)</h2>
              <button onClick={() => { setShowImport(false); setImportPreview([]); setImportError(''); }} className="text-slate-500 hover:text-slate-300">
                <X size={18} />
              </button>
            </div>

            {importDone ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <CheckCircle size={40} className="text-emerald-400" />
                <div className="text-emerald-400 font-semibold">Import successful!</div>
              </div>
            ) : (
              <>
                <div className="bg-[#12121E] border border-[#1E2038] rounded-xl p-4 mb-4">
                  <p className="text-sm text-slate-400 mb-2">Expected CSV format:</p>
                  <code className="text-xs text-violet-300 font-mono">Date,Description,Category,Amount<br/>2026-07-01,Groceries,Food,87.40</code>
                </div>

                <div
                  className="border-2 border-dashed border-[#2D2D50] rounded-xl p-8 text-center cursor-pointer hover:border-violet-500/50 transition-colors mb-4"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={24} className="text-slate-500 mx-auto mb-2" />
                  <div className="text-slate-400 text-sm">Click to select a CSV file</div>
                  <div className="text-slate-600 text-xs mt-1">or drag and drop</div>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                </div>

                {importError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4 text-rose-400 text-sm">{importError}</div>
                )}

                {importPreview.length > 0 && (
                  <>
                    <div className="text-sm text-slate-400 mb-2">{importPreview.length} transactions found — preview:</div>
                    <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
                      {importPreview.slice(0, 10).map(t => (
                        <div key={t.id} className="flex items-center gap-3 bg-[#12121E] px-3 py-2 rounded-lg text-xs">
                          <span className="text-slate-500 w-24 flex-shrink-0">{t.date}</span>
                          <span className="text-slate-300 flex-1 truncate">{t.description}</span>
                          <span className="text-rose-400 font-medium flex-shrink-0">{formatCurrency(Math.abs(t.amount))}</span>
                        </div>
                      ))}
                      {importPreview.length > 10 && <div className="text-xs text-slate-500 text-center py-1">+{importPreview.length - 10} more</div>}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setImportPreview([]); if (fileRef.current) fileRef.current.value = ''; }} className="btn-secondary flex-1">Clear</button>
                      <button onClick={confirmImport} className="btn-primary flex-1">Import {importPreview.length} Transactions</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content">
            <h2 className="text-lg font-bold text-white mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="e.g. Grocery shopping" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
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
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-slate-300">Recurring expense</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
