import { useState } from 'react';
import { Check, Clock, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

export default function Bills() {
  const { bills, updateBillPaid } = useStore();
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const filtered = bills.filter(b =>
    filter === 'all' ? true : filter === 'paid' ? b.paid : !b.paid
  ).sort((a, b) => a.dueDay - b.dueDay);

  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);
  const totalUnpaid = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);
  const paidCount = bills.filter(b => b.paid).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bill Manager</h1>
          <p className="text-slate-400 text-sm mt-0.5">{paidCount}/{bills.length} bills paid this month</p>
        </div>
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
                    <span className="badge-red flex items-center gap-1"><Clock size={10} /> Due {bill.dueDay}th July</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-white">{formatCurrency(bill.amount)}</div>
                <div className="text-xs text-slate-500 mt-0.5">per month</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1E2038] flex gap-2">
              <button
                onClick={() => updateBillPaid(bill.id, !bill.paid)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
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
          {bills.sort((a, b) => b.amount - a.amount).map(bill => (
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
    </div>
  );
}
