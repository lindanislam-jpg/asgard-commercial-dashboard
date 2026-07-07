import { useState } from 'react';
import { Plus, Pencil, Trash2, Target, Brain } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, calculateSavingsGoalCompletion } from '../utils';
import { SavingsGoal } from '../types';

const ICONS = ['🛡️','✈️','🚗','🏠','🖥️','💍','🎓','🏖️','🚀','💼','🎸','⛵','🏋️','🎮','📱','🌍'];
const COLORS = ['#10B981','#0EA5E9','#A855F7','#6366F1','#F59E0B','#F43F5E','#06B6D4','#84CC16'];

const AI_TIPS = [
  "Based on your spending patterns, you could save an extra €120/month by reducing restaurant visits by 2 per week.",
  "Your Emergency Fund will be complete in 13 months at the current rate. Consider increasing contributions to reach it sooner.",
  "You're spending 18% of your income on subscriptions and entertainment. Redirecting 5% to your House Deposit goal would accelerate it by 8 months.",
  "Your cheapest month this year was February at €2,650. Repeating that discipline twice would fully fund your Gaming PC goal.",
  "At your current savings rate, you'll reach financial independence in approximately 22 years. Increasing savings by €200/month would reduce this to 18 years.",
];

export default function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', icon: '🎯', color: '#10B981' });

  const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const monthlyTotal = savingsGoals.reduce((s, g) => s + g.monthlyContribution, 0);

  const openAdd = () => {
    setEditGoal(null);
    setForm({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', icon: '🎯', color: '#10B981' });
    setShowForm(true);
  };

  const openEdit = (g: SavingsGoal) => {
    setEditGoal(g);
    setForm({ name: g.name, targetAmount: String(g.targetAmount), currentAmount: String(g.currentAmount), monthlyContribution: String(g.monthlyContribution), icon: g.icon, color: g.color });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      icon: form.icon,
      color: form.color,
    };
    if (editGoal) {
      updateSavingsGoal(editGoal.id, data);
    } else {
      addSavingsGoal({ ...data, id: `sg_${Date.now()}`, createdAt: new Date().toISOString() });
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
          <p className="text-slate-400 text-sm mt-0.5">{savingsGoals.length} goals · {formatCurrency(totalSaved)} saved</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Total Saved</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalSaved)}</div>
          <div className="progress-bar mt-3">
            <div className="progress-fill bg-emerald-500" style={{ width: `${(totalSaved / totalTarget) * 100}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-1">{((totalSaved / totalTarget) * 100).toFixed(0)}% of total targets</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Total Target</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalTarget)}</div>
          <div className="text-xs text-slate-500 mt-1">{formatCurrency(totalTarget - totalSaved)} remaining</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Monthly Contributions</div>
          <div className="text-2xl font-bold text-violet-400 mt-1">{formatCurrency(monthlyTotal)}</div>
          <div className="text-xs text-slate-500 mt-1">Across {savingsGoals.length} goals</div>
        </div>
      </div>

      {/* AI Coach */}
      <div className="card p-5 bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border-violet-500/20">
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Brain size={17} className="text-violet-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">AI Savings Coach</div>
            <p className="text-slate-200 text-sm leading-relaxed">{AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]}</p>
          </div>
        </div>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map(goal => {
          const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const completionDate = calculateSavingsGoalCompletion(goal);
          const monthsLeft = Math.ceil((goal.targetAmount - goal.currentAmount) / (goal.monthlyContribution || 1));
          const daysToGo = goal.currentAmount >= goal.targetAmount;

          return (
            <div key={goal.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{goal.icon}</div>
                  <div>
                    <div className="text-white font-semibold">{goal.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {daysToGo ? '🎉 Goal reached!' : `~${monthsLeft} months to go`}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(goal)} className="text-slate-600 hover:text-violet-400 transition-colors p-1.5">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteSavingsGoal(goal.id)} className="text-slate-600 hover:text-rose-400 transition-colors p-1.5">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-semibold">{formatCurrency(goal.currentAmount)}</span>
                <span className="text-slate-500">of {formatCurrency(goal.targetAmount)}</span>
              </div>

              <div className="progress-bar h-3 mb-3">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: goal.color, boxShadow: `0 0 10px ${goal.color}40` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#0A0A14] rounded-lg p-2">
                  <div className="text-sm font-semibold text-white">{pct.toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Complete</div>
                </div>
                <div className="bg-[#0A0A14] rounded-lg p-2">
                  <div className="text-sm font-semibold text-white">{formatCurrency(goal.monthlyContribution)}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Monthly</div>
                </div>
                <div className="bg-[#0A0A14] rounded-lg p-2">
                  <div className="text-sm font-semibold text-white">
                    {daysToGo ? 'Done!' : completionDate.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' })}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Target date</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content">
            <h2 className="text-lg font-bold text-white mb-4">{editGoal ? 'Edit Goal' : 'New Savings Goal'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Goal Name</label>
                <input className="input" placeholder="e.g. Dream Holiday" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Target Amount (€)</label>
                  <input className="input" type="number" step="0.01" min="1" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Current Amount (€)</label>
                  <input className="input" type="number" step="0.01" min="0" value={form.currentAmount} onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Monthly Contribution (€)</label>
                <input className="input" type="number" step="0.01" min="0" value={form.monthlyContribution} onChange={e => setForm(p => ({ ...p, monthlyContribution: e.target.value }))} />
              </div>
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))}
                      className={`w-10 h-10 text-xl rounded-lg border transition-all ${form.icon === icon ? 'border-violet-500 bg-violet-500/20' : 'border-[#2D2D50] bg-[#1C1C30] hover:border-violet-500/50'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setForm(p => ({ ...p, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ background: color }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editGoal ? 'Save Changes' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
