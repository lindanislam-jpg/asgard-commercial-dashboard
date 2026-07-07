import { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { formatCurrency } from '../utils';

const SUBS = [
  { id: 's1', name: 'Netflix', category: 'Streaming', amount: 15.99, renewal: '2026-08-05', used: true, icon: '🎬', color: '#E50914' },
  { id: 's2', name: 'Spotify', category: 'Music', amount: 9.99, renewal: '2026-08-05', used: true, icon: '🎵', color: '#1DB954' },
  { id: 's3', name: 'Streaming Bundle', category: 'Streaming', amount: 19.99, renewal: '2026-08-25', used: false, icon: '📺', color: '#0078D4' },
  { id: 's4', name: 'iCloud Storage', category: 'Cloud', amount: 2.99, renewal: '2026-08-12', used: true, icon: '☁️', color: '#3B82F6' },
  { id: 's5', name: 'Adobe Creative', category: 'Software', amount: 59.99, renewal: '2026-08-18', used: true, icon: '🎨', color: '#FF0000' },
  { id: 's6', name: 'GitHub Pro', category: 'Developer', amount: 3.67, renewal: '2026-08-20', used: true, icon: '💻', color: '#6366F1' },
  { id: 's7', name: 'Notion', category: 'Productivity', amount: 8, renewal: '2026-08-10', used: false, icon: '📝', color: '#000000' },
  { id: 's8', name: 'ChatGPT Plus', category: 'AI', amount: 18.84, renewal: '2026-08-03', used: true, icon: '🤖', color: '#10B981' },
];

export default function Subscriptions() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeSubs = SUBS.filter(s => !dismissed.includes(s.id));
  const unusedSubs = activeSubs.filter(s => !s.used);
  const totalMonthly = activeSubs.reduce((s, sub) => s + sub.amount, 0);
  const totalAnnual = totalMonthly * 12;
  const unusedCost = unusedSubs.reduce((s, sub) => s + sub.amount, 0);

  const sorted = [...activeSubs].sort((a, b) => {
    if (!a.used && b.used) return -1;
    if (a.used && !b.used) return 1;
    return b.amount - a.amount;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription Manager</h1>
        <p className="text-slate-400 text-sm mt-0.5">{activeSubs.length} active subscriptions tracked</p>
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
                You have {unusedSubs.length} subscriptions you haven't used recently.
                Cancelling them would save you {formatCurrency(unusedCost * 12)} per year.
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
                <div className="text-xs text-slate-500 mt-0.5">
                  Renews {new Date(sub.renewal).toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-white">{formatCurrency(sub.amount)}<span className="text-xs text-slate-500">/mo</span></div>
                <div className="text-xs text-slate-500">{formatCurrency(sub.amount * 12)}/yr</div>
              </div>
            </div>

            {!sub.used && (
              <div className="mt-4 pt-4 border-t border-[#1E2038]">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDismissed(d => [...d, sub.id])}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X size={12} /> Cancel Subscription
                  </button>
                  <button
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1C1C30] border border-[#2D2D50] text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Keep
                  </button>
                </div>
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
            activeSubs.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + s.amount; return acc; }, {} as Record<string, number>)
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
    </div>
  );
}
