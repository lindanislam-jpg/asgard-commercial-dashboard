import { useState } from 'react';
import { Check, Clock, Plus, Trash2, Pencil } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Bill } from '../types';

const BILL_ICONS = ['🏠','⚡','🔥','📡','📱','🎬','🎵','💪','🚗','❤️','💧','🌐','📺','☕','🏥','🎓','💼','🏦'];
const BILL_CATEGORIES = ['Housing', 'Utilities', 'Subscriptions', 'Health', 'Insurance', 'Transport', 'Entertainment', 'Education', 'Other'];

const BLANK: Omit<Bill, 'id'> = { name: '', amount: 0, category: 'Utilities', dueDay: 1, paid: false, recurring: true, icon: '📄' };

export default function Bills() {
  const { bills, addBill, updateBill, deleteBill, updateBillPaid } = useStore();
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [form, setForm] = useState<Omit<Bill, 'id'>>({ ...BLANK });

  const filtered = bills.filter(b =>
    filter === 'all' ? true : filter === 'paid' ? b.paid : !b.paid
  ).sort((a, b) => a.dueDay - b.dueDay);

  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);
  const totalUnpaid = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter(b => b.paid).length;

  const openAdd = () => {
    setEditBill(null);
    setForm({ ...BLANK });
    setShowForm(true);
  };

  const openEdit = (b: Bill) => {
    setEditBill(b);
    setForm({ name: b.name, amount: b.amount, category: b.category, dueDay: b.dueDay, paid: b.paid, recurring: b.recurring, icon: b.icon });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editBill) {
      updateBill(editBill.id, form);
    } else {
      addBill({ ...form, id: `bill_${Date.now()}` });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bill Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">{paidCount}/{bills.length} bills paid this month</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Bill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Monthly Total</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalMonthly)}</div>
          <div className="text-xs text-slate-500 mt-0.5">Annual: {formatCurrency(totalMonthly * 12)}</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Paid</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalPaid)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{paidCount} bills</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Remaining</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalUnpaid)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{bills.length - paidCount} bills</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Progress</div>
          <div className="text-2xl font-bold text-violet-400 mt-1">
            {totalMonthly > 0 ? ((totalPaid / totalMonthly) * 100).toFixed(0) : 0}%
          </div>
          <div className="progress-bar mt-2">
            <div className="progress-fill bg-gradient-to-r from-violet-600 to-purple-500"
              style={{ width: `${totalMonthly > 0 ? (totalPaid / totalMonthly) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2">
        {(['all', 'unpaid', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              filter === f
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-[#1C1C30] border-[#2D2D50] text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unpaid' && bills.filter(b => !b.paid).length > 0 &&
              <span className="ml-2 bg-rose-500/20 text-rose-400 text-xs px-1.5 py-0.5 rounded-full">
                {bills.filter(b => !b.paid).length}
              </span>
            }
          </button>
        ))}
      </div>

      {/* Bills grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(bill => (
          <div
            key={bill.id}
            className={`card p-5 transition-all ${bill.paid ? 'opacity-60' : 'card-hover'}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border ${
                bill.paid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#1C1C30] border-[#2D2D50]'
              }`}>
                {bill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{bill.name}</span>
                  {bill.recurring && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                      Monthly
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{bill.category}</div>
                <div className="flex items-center gap-2 mt-1">
                  {bill.paid ? (
                    <span className="badge-green flex items-center gap-1"><Check size={10} /> Paid</span>
                  ) : (
                    <span className="badge-red flex items-center gap-1"><Clock size={10} /> Due {bill.dueDay}th</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-lg font-bold text-white">{formatCurrency(bill.amount)}</div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(bill)} className="text-slate-600 hover:text-violet-400 transition-colors p-1">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteBill(bill.id)} className="text-slate-600 hover:text-rose-400 transition-colors p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1E2038]">
              <button
                onClick={() => updateBillPaid(bill.id, !bill.paid)}
                className={`w-full py-2 text-sm font-medium rounded-lg border transition-all ${
                  bill.paid
                    ? 'bg-[#1C1C30] border-[#2D2D50] text-slate-400 hover:text-slate-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {bill.paid ? 'Mark as Unpaid' : '✓ Mark as Paid'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Annual summary */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">Annual Bill Summary</h2>
        <div className="space-y-2">
          {[...bills].sort((a, b) => b.amount - a.amount).map(bill => (
            <div key={bill.id} className="flex items-center gap-3">
              <span className="text-base w-6 text-center">{bill.icon}</span>
              <span className="text-sm text-slate-300 flex-1">{bill.name}</span>
              <span className="text-sm text-slate-400">{formatCurrency(bill.amount)}/mo</span>
              <span className="text-sm font-semibold text-slate-200 w-24 text-right">{formatCurrency(bill.amount * 12)}/yr</span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-3 mt-1 border-t border-[#1E2038]">
            <span className="text-base w-6" />
            <span className="text-sm font-semibold text-slate-200 flex-1">Total</span>
            <span className="text-sm font-bold text-violet-400">{formatCurrency(totalMonthly)}/mo</span>
            <span className="text-sm font-bold text-violet-400 w-24 text-right">{formatCurrency(totalMonthly * 12)}/yr</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content">
            <h2 className="text-lg font-bold text-white mb-4">{editBill ? 'Edit Bill' : 'Add Bill'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Bill Name</label>
                <input className="input" placeholder="e.g. Electricity" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount (€)</label>
                  <input className="input" type="number" step="0.01" min="0" value={form.amount || ''}
                    onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} required />
                </div>
                <div>
                  <label className="label">Due Day of Month</label>
                  <input className="input" type="number" min="1" max="31" value={form.dueDay}
                    onChange={e => setForm(p => ({ ...p, dueDay: parseInt(e.target.value) || 1 }))} required />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {BILL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {BILL_ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))}
                      className={`w-10 h-10 text-xl rounded-lg border transition-all ${form.icon === icon ? 'border-violet-500 bg-violet-500/20' : 'border-[#2D2D50] bg-[#1C1C30] hover:border-violet-500/50'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({ ...p, recurring: e.target.checked }))} className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-slate-300">Recurring monthly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.paid} onChange={e => setForm(p => ({ ...p, paid: e.target.checked }))} className="w-4 h-4 accent-violet-500" />
                  <span className="text-sm text-slate-300">Already paid</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editBill ? 'Save Changes' : 'Add Bill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
