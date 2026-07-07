import { useMemo, useState } from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, getMonthlyExpenses } from '../utils';

const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06'];

export default function EmergencyFund() {
  const { transactions, savingsGoals } = useStore();

  const avgMonthlyExpenses = useMemo(() => {
    const totals = MONTHS.map(m => getMonthlyExpenses(transactions, m));
    const nonZero = totals.filter(t => t > 0);
    return nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 2000;
  }, [transactions]);

  const emergencyGoal = savingsGoals.find(g => g.name.toLowerCase().includes('emergency'));
  const currentSaved = emergencyGoal?.currentAmount ?? 0;
  const monthlyContribution = emergencyGoal?.monthlyContribution ?? 300;

  const [monthsCoverage, setMonthsCoverage] = useState(6);
  const [customExpenses, setCustomExpenses] = useState('');
  const [customContribution, setCustomContribution] = useState('');

  const monthlyExpenses = customExpenses ? parseFloat(customExpenses) || avgMonthlyExpenses : avgMonthlyExpenses;
  const contribution = customContribution ? parseFloat(customContribution) || monthlyContribution : monthlyContribution;
  const targetAmount = monthlyExpenses * monthsCoverage;
  const remaining = Math.max(targetAmount - currentSaved, 0);
  const coverageMonths = monthlyExpenses > 0 ? currentSaved / monthlyExpenses : 0;
  const monthsToGoal = contribution > 0 ? Math.ceil(remaining / contribution) : Infinity;
  const completionPct = Math.min((currentSaved / targetAmount) * 100, 100);

  const status = coverageMonths >= 6 ? 'excellent' : coverageMonths >= 3 ? 'good' : coverageMonths >= 1 ? 'fair' : 'critical';
  const statusConfig = {
    excellent: { label: 'Excellent', color: '#10B981', Icon: CheckCircle, bg: 'bg-emerald-500/10 border-emerald-500/20' },
    good: { label: 'Good', color: '#06B6D4', Icon: CheckCircle, bg: 'bg-cyan-500/10 border-cyan-500/20' },
    fair: { label: 'Needs Improvement', color: '#F59E0B', Icon: AlertTriangle, bg: 'bg-amber-500/10 border-amber-500/20' },
    critical: { label: 'Critical', color: '#F43F5E', Icon: AlertTriangle, bg: 'bg-rose-500/10 border-rose-500/20' },
  }[status];

  const scenarios = [3, 6, 9, 12].map(m => ({
    months: m,
    target: monthlyExpenses * m,
    monthsToReach: contribution > 0 ? Math.max(0, Math.ceil(((monthlyExpenses * m) - currentSaved) / contribution)) : Infinity,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Emergency Fund Calculator</h1>
        <p className="text-slate-400 text-sm mt-0.5">Plan your financial safety net</p>
      </div>

      {/* Status card */}
      <div className={`card p-6 ${statusConfig.bg}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${statusConfig.color}20`, border: `1px solid ${statusConfig.color}40` }}>
            <statusConfig.Icon size={26} style={{ color: statusConfig.color }} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: statusConfig.color }}>
              Emergency Fund Status
            </div>
            <div className="text-2xl font-bold text-white">{statusConfig.label}</div>
            <div className="text-slate-400 text-sm mt-0.5">
              You currently have <strong className="text-white">{coverageMonths.toFixed(1)} months</strong> of expenses covered
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{formatCurrency(currentSaved)}</div>
            <div className="text-slate-500 text-sm">saved so far</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{completionPct.toFixed(0)}% of {monthsCoverage}-month goal</span>
            <span>{formatCurrency(currentSaved)} / {formatCurrency(targetAmount)}</span>
          </div>
          <div className="h-3 rounded-full bg-[#1E2038] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%`, background: statusConfig.color }} />
          </div>
        </div>
      </div>

      {/* Calculator inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <label className="label">Monthly Expenses (€)</label>
          <input
            className="input mt-1"
            type="number"
            step="50"
            min="0"
            placeholder={avgMonthlyExpenses.toFixed(0)}
            value={customExpenses}
            onChange={e => setCustomExpenses(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Auto-detected: {formatCurrency(avgMonthlyExpenses)}/mo from your last 6 months
          </p>
        </div>

        <div className="card p-5">
          <label className="label">Target Coverage</label>
          <div className="flex gap-2 mt-1">
            {[3, 6, 9, 12].map(m => (
              <button
                key={m}
                onClick={() => setMonthsCoverage(m)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg border transition-all ${
                  monthsCoverage === m
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-[#1C1C30] border-[#2D2D50] text-slate-400 hover:text-slate-200'
                }`}
              >{m}mo</button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            {monthsCoverage === 3 ? 'Minimum recommended' : monthsCoverage === 6 ? 'Standard recommendation' : monthsCoverage === 9 ? 'Conservative approach' : 'Maximum security'}
          </p>
        </div>

        <div className="card p-5">
          <label className="label">Monthly Contribution (€)</label>
          <input
            className="input mt-1"
            type="number"
            step="50"
            min="0"
            placeholder={monthlyContribution.toFixed(0)}
            value={customContribution}
            onChange={e => setCustomContribution(e.target.value)}
          />
          <p className="text-xs text-slate-500 mt-1.5">
            {emergencyGoal ? `Current goal: €${monthlyContribution}/mo` : 'Set a monthly target'}
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Target Amount', value: formatCurrency(targetAmount), sub: `${monthsCoverage} months × ${formatCurrency(monthlyExpenses)}`, color: '#7C3AED' },
          { label: 'Amount Remaining', value: formatCurrency(remaining), sub: remaining === 0 ? 'Goal reached!' : 'Still to save', color: remaining === 0 ? '#10B981' : '#F43F5E' },
          { label: 'Time to Goal', value: monthsToGoal === Infinity ? '∞' : monthsToGoal === 0 ? 'Done!' : `${monthsToGoal} months`, sub: monthsToGoal !== Infinity && monthsToGoal > 0 ? `at ${formatCurrency(contribution)}/mo` : '', color: '#06B6D4' },
          { label: 'Coverage', value: `${coverageMonths.toFixed(1)} months`, sub: coverageMonths >= monthsCoverage ? 'Target reached' : `Need ${monthsCoverage - coverageMonths > 0 ? (monthsCoverage - coverageMonths).toFixed(1) : 0} more`, color: '#10B981' },
        ].map(m => (
          <div key={m.label} className="card p-5">
            <div className="text-slate-400 text-sm">{m.label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Scenario comparison */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#1E2038] flex items-center gap-2">
          <Shield size={16} className="text-violet-400" />
          <h2 className="text-white font-semibold">Coverage Scenarios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-[#1E2038] bg-[#0A0A14]">
                <th className="text-left px-4 py-3">Coverage</th>
                <th className="text-right px-4 py-3">Target</th>
                <th className="text-right px-4 py-3">Remaining</th>
                <th className="text-right px-4 py-3">Months to reach</th>
                <th className="text-right px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(s => {
                const rem = Math.max(s.target - currentSaved, 0);
                const done = rem === 0;
                return (
                  <tr key={s.months}
                    className={`border-b border-[#1E2038] last:border-0 transition-colors ${monthsCoverage === s.months ? 'bg-violet-500/5' : 'hover:bg-[#1C1C30]'}`}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-200">{s.months} months</span>
                      {monthsCoverage === s.months && <span className="ml-2 text-[10px] text-violet-400 font-bold uppercase">selected</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-right font-medium">{formatCurrency(s.target)}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${done ? 'text-emerald-400' : 'text-rose-400'}`}>{done ? '—' : formatCurrency(rem)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 text-right">{done ? '—' : s.monthsToReach === Infinity ? 'Never (set contribution)' : `${s.monthsToReach} months`}</td>
                    <td className="px-4 py-3 text-right">
                      {done
                        ? <span className="badge-green text-xs">Reached</span>
                        : s.months <= 3 ? <span className="badge-yellow text-xs">Minimum</span>
                        : s.months <= 6 ? <span className="badge-purple text-xs">Recommended</span>
                        : <span className="text-xs text-slate-500">Optional</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="card p-5 bg-gradient-to-r from-violet-900/20 to-indigo-900/20 border-violet-500/20">
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={14} className="text-violet-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">Why Emergency Funds Matter</div>
            <ul className="space-y-1.5 text-sm text-slate-300">
              <li>• <strong>3 months</strong> — minimum for stable employment with low expenses</li>
              <li>• <strong>6 months</strong> — standard recommendation for most people</li>
              <li>• <strong>9–12 months</strong> — ideal if self-employed, freelance, or single income household</li>
              <li>• Keep it in a <strong>high-yield savings account</strong> that's separate from your day-to-day account</li>
              <li>• Once built, only touch it for true emergencies — job loss, medical, urgent repairs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Where to build it */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">Accelerate Your Fund</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            {[
              `Automate ${formatCurrency(contribution)}/mo transfer on payday`,
              'Direct any bonuses or freelance income here first',
              'Review unused subscriptions — potential €${(19.99 + 8).toFixed(2)}/mo saving',
              'Restaurant budget reduction of €50/mo = 6 weeks faster',
              'Tax refunds go straight to emergency fund',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">→</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={15} className="text-cyan-400" />
            <h2 className="text-white font-semibold text-sm">Your Progress Summary</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Current savings', value: formatCurrency(currentSaved), positive: true },
              { label: `${monthsCoverage}-month target`, value: formatCurrency(targetAmount) },
              { label: 'Shortfall', value: formatCurrency(remaining), positive: remaining === 0 },
              { label: 'Monthly contribution', value: formatCurrency(contribution), positive: true },
              { label: 'Completion', value: `${completionPct.toFixed(1)}%`, positive: completionPct >= 100 },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-slate-400">{r.label}</span>
                <span className={r.positive ? 'text-emerald-400 font-semibold' : 'text-slate-200 font-semibold'}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
