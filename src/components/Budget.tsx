import { useMemo, useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, CATEGORY_COLORS } from '../utils';

export default function Budget() {
  const { transactions, budgets, updateBudget, currentMonth } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const budgetData = useMemo(() => {
    return budgets.map(b => {
      const spent = Math.abs(
        transactions
          .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonth))
          .reduce((s, t) => s + t.amount, 0)
      );
      const pct = b.budgeted > 0 ? (spent / b.budgeted) * 100 : 0;
      const status = pct >= 100 ? 'over' : pct >= 80 ? 'warning' : 'safe';
      return { ...b, spent, remaining: b.budgeted - spent, pct, status };
    }).sort((a, b) => b.pct - a.pct);
  }, [budgets, transactions, currentMonth]);

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const overBudgetCount = budgetData.filter(b => b.status === 'over').length;
  const warningCount = budgetData.filter(b => b.status === 'warning').length;

  const startEdit = (b: typeof budgetData[0]) => {
    setEditingId(b.id);
    setEditValue(String(b.budgeted));
  };

  const saveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) updateBudget(id, val);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Budget Planner</h1>
        <p className="text-slate-400 text-sm mt-0.5">Monthly budgets for July 2026</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Total Budget</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalBudgeted)}</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Total Spent</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(totalSpent)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{((totalSpent / totalBudgeted) * 100).toFixed(0)}% used</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Remaining</div>
          <div className={`text-2xl font-bold mt-1 ${totalBudgeted - totalSpent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(Math.abs(totalBudgeted - totalSpent))}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Budget Alerts</div>
          <div className="text-2xl font-bold text-white mt-1">
            {overBudgetCount > 0 && <span className="text-rose-400">{overBudgetCount} over</span>}
            {warningCount > 0 && <span className="text-amber-400 ml-2">{warningCount} warning</span>}
            {overBudgetCount === 0 && warningCount === 0 && <span className="text-emerald-400">All clear</span>}
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300 font-medium">Overall Budget Used</span>
          <span className={totalSpent > totalBudgeted ? 'text-rose-400' : 'text-slate-300'}>
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudgeted)}
          </span>
        </div>
        <div className="progress-bar h-3">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%`,
              background: totalSpent > totalBudgeted ? '#EF4444' : totalSpent / totalBudgeted > 0.8 ? '#F59E0B' : 'linear-gradient(90deg, #7C3AED, #A855F7)'
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-500">{((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget used</span>
          <span className="text-xs text-slate-500">8 days left in month</span>
        </div>
      </div>

      {/* Budget categories */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#1E2038]">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div className="col-span-3">Category</div>
            <div className="col-span-2 text-right">Budget</div>
            <div className="col-span-2 text-right">Spent</div>
            <div className="col-span-2 text-right">Remaining</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-1" />
          </div>
        </div>

        <div>
          {budgetData.map(b => {
            const color = CATEGORY_COLORS[b.category] || '#94A3B8';
            const barColor = b.status === 'over' ? '#EF4444' : b.status === 'warning' ? '#F59E0B' : color;
            return (
              <div key={b.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors">
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-sm text-slate-200 font-medium truncate">{b.category}</span>
                </div>

                <div className="col-span-2 text-right">
                  {editingId === b.id ? (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-slate-400 text-xs">€</span>
                      <input
                        autoFocus
                        className="w-20 bg-[#1C1C30] border border-violet-500/50 rounded px-1.5 py-0.5 text-xs text-white text-right"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(b.id); if (e.key === 'Escape') setEditingId(null); }}
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-slate-300 font-medium">{formatCurrency(b.budgeted)}</span>
                  )}
                </div>

                <div className="col-span-2 text-right">
                  <span className={`text-sm font-medium ${b.status === 'over' ? 'text-rose-400' : 'text-slate-300'}`}>
                    {formatCurrency(b.spent)}
                  </span>
                </div>

                <div className="col-span-2 text-right">
                  <span className={`text-sm font-medium ${b.remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {b.remaining >= 0 ? formatCurrency(b.remaining) : `-${formatCurrency(Math.abs(b.remaining))}`}
                  </span>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 progress-bar h-1.5">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(b.pct, 100)}%`, background: barColor }}
                      />
                    </div>
                    <span className={`text-xs font-semibold w-9 text-right ${
                      b.status === 'over' ? 'text-rose-400' : b.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {b.pct.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="col-span-1 flex justify-end gap-1">
                  {editingId === b.id ? (
                    <>
                      <button onClick={() => saveEdit(b.id)} className="text-emerald-400 hover:text-emerald-300 p-1"><Check size={13} /></button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300 p-1"><X size={13} /></button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(b)} className="text-slate-600 hover:text-violet-400 transition-colors p-1"><Edit2 size={13} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-emerald-500" />
          <span>Safe (&lt;80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-amber-500" />
          <span>Warning (80–100%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-rose-500" />
          <span>Over budget (&gt;100%)</span>
        </div>
      </div>
    </div>
  );
}
