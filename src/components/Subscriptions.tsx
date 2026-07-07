import { useState } from 'react';
import { AlertTriangle, CheckCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Subscription } from '../types';

const SUB_ICONS = ['🎬','🎵','📺','☁️','🎨','💻','📝','🤖','🎮','📱','📊','🔒','🗄️','🎙️','📰','🛒'];
const SUB_CATEGORIES = ['Streaming', 'Music', 'Cloud', 'Software', 'Developer', 'Productivity', 'AI', 'Gaming', 'News', 'Other'];

const BLANK: Omit<Subscription, 'id'> = {
  name: '', category: 'Streaming', amount: 0, renewal: '', used: true, icon: '📄', color: '#7C3AED',
};

export default function Subscriptions() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [form, setForm] = useState<Omit<Subscription, 'id'>>({ ...BLANK });

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const totalAnnual = totalMonthly * 12;
  const unusedSubs = subscriptions.filter(s => !s.used);
  const unusedCost = unusedSubs.reduce((s, sub) => s + sub.amount, 0);

  const sorted = [...subscriptions].sort((a, b) => {
    if (!a.used && b.used) return -1;
    if (a.used && !b.used) return 1;
    return b.amount - a.amount;
  });

  const openAdd = () => {
    setEditSub(null);
    setForm({ ...BLANK });
    setShowForm(true);
  };

  const openEdit = (s: Subscription) => {
    setEditSub(s);
    setForm({ name: s.name, category: s.category, amount: s.amount, renewal: s.renewal, used: s.used, icon: s.icon, color: s.color });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSub) {
      updateSubscription(editSub.id, form);
    } else {
      addSubscription({ ...form, id: `sub_${Date.now()}` });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscription Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">{subscriptions.length} active subscriptions tracked</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Monthly Total</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalMonthly)}</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Annual Total</div>
          <div className="text-2xl font-bold text-violet-400 mt-1">{formatCurrency(totalAnnual)}</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Unused</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(unusedCost)}/mo</div>
          <div className="text-xs text-slate-500 mt-0.5">{unusedSubs.length} subscriptions</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Potential Savings</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(unusedCost * 12)}/yr</div>
          <div className="text-xs text-slate-500 mt-0.5">By cancelling unused</div>
        </div>
      </div>

      {/* Alert for unused */}
      {unusedSubs.length > 0 && (
        <div className="card p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex gap-3 items-start">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-amber-300 font-semibold text-sm">Unused Subscriptions Detected</div>
              <p className="text-slate-400 text-xs mt-1">
                You have {unusedSubs.length} subscription{unusedSubs.length > 1 ? 's' : ''} you haven't used recently.
                Cancelling would save {formatCurrency(unusedCost * 12)} per year.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map(sub => (
          <div key={sub.id} className={`card p-5 ${!sub.used ? 'border-amber-500/20' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${sub.color}15`, border: `1px solid ${sub.color}30` }}>
                {sub.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{sub.name}</span>
                  {sub.used ? (
                    <span className="badge-green flex items-center gap-1"><CheckCircle size={9} /> Active</span>
                  ) : (
                    <span className="badge-yellow flex items-center gap-1"><AlertTriangle size={9} /> Unused</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{sub.category}</div>
                {sub.renewal && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    Renews {new Date(sub.renewal).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div>
                  <div className="text-lg font-bold text-white">{formatCurrency(sub.amount)}<span className="text-xs text-slate-500">/mo</span></div>
                  <div className="text-xs text-slate-500 text-right">{formatCurrency(sub.amount * 12)}/yr</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(sub)} className="text-slate-600 hover:text-violet-400 transition-colors p-1">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteSubscription(sub.id)} className="text-slate-600 hover:text-rose-400 transition-colors p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {!sub.used && (
              <div className="mt-4 pt-4 border-t border-[#1E2038]">
                <button
                  onClick={() => deleteSubscription(sub.id)}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">Spending by Category</h2>
        <div className="space-y-3">
          {Object.entries(
            subscriptions.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + s.amount; return acc; }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-24 flex-shrink-0">{cat}</span>
              <div className="flex-1 progress-bar h-2">
                <div className="progress-fill bg-gradient-to-r from-violet-600 to-purple-500"
                  style={{ width: `${(amount / totalMonthly) * 100}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-200 w-16 text-right">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content">
            <h2 className="text-lg font-bold text-white mb-4">{editSub ? 'Edit Subscription' : 'Add Subscription'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Service Name</label>
                <input className="input" placeholder="e.g. Netflix" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Monthly Cost (€)</label>
                  <input className="input" type="number" step="0.01" min="0" value={form.amount || ''}
                    onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} required />
                </div>
                <div>
                  <label className="label">Renewal Date</label>
                  <input className="input" type="date" value={form.renewal}
                    onChange={e => setForm(p => ({ ...p, renewal: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {SUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {SUB_ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))}
                      className={`w-10 h-10 text-xl rounded-lg border transition-all ${form.icon === icon ? 'border-violet-500 bg-violet-500/20' : 'border-[#2D2D50] bg-[#1C1C30] hover:border-violet-500/50'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.used} onChange={e => setForm(p => ({ ...p, used: e.target.checked }))} className="w-4 h-4 accent-violet-500" />
                <span className="text-sm text-slate-300">Currently using this subscription</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editSub ? 'Save Changes' : 'Add Subscription'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
