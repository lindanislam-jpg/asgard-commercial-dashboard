import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, getMonthlyIncome, getMonthlyExpenses, getExpensesByCategory, CATEGORY_COLORS } from '../utils';

const MONTHS = ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'];
const LABELS = ['January','February','March','April','May','June','July'];
const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

export default function Reports() {
  const { transactions } = useStore();

  const monthlyData = useMemo(() =>
    MONTHS.map((m, i) => {
      const income = getMonthlyIncome(transactions, m);
      const expenses = getMonthlyExpenses(transactions, m);
      return { month: SHORT[i], fullMonth: LABELS[i], income, expenses, net: income - expenses, savings: Math.max(income - expenses, 0) };
    }),
    [transactions]
  );

  const ytdIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const ytdExpenses = monthlyData.reduce((s, d) => s + d.expenses, 0);
  const ytdSavings = ytdIncome - ytdExpenses;
  const avgMonthlyIncome = ytdIncome / monthlyData.filter(d => d.income > 0).length;
  const avgMonthlyExpenses = ytdExpenses / monthlyData.filter(d => d.expenses > 0).length;

  const ytdCategories = useMemo(() => {
    const by = getExpensesByCategory(transactions);
    return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || '#94A3B8' }));
  }, [transactions]);

  const handleExport = (type: 'csv' | 'pdf') => {
    if (type === 'csv') {
      const headers = 'Date,Description,Category,Type,Amount\n';
      const rows = transactions.map(t =>
        `${t.date},"${t.description}",${t.category},${t.type},${t.amount}`
      ).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lindani-finance-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const fmt = (v: number) => `€${v.toFixed(2)}`;
      const rows = monthlyData.map(r => {
        const rate = r.income > 0 ? ((r.net / r.income) * 100).toFixed(1) : '0.0';
        return `<tr><td>${r.fullMonth}</td><td style="color:#10B981">${fmt(r.income)}</td><td style="color:#F43F5E">${fmt(r.expenses)}</td><td style="color:${r.net>=0?'#10B981':'#F43F5E'}">${r.net>=0?'+':''}${fmt(r.net)}</td><td>${rate}%</td></tr>`;
      }).join('');
      const cats = ytdCategories.slice(0, 10).map(c =>
        `<tr><td>${c.name}</td><td style="color:#F43F5E">${fmt(c.value)}</td><td>${((c.value/ytdExpenses)*100).toFixed(1)}%</td></tr>`
      ).join('');
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Financial Report 2026 — Lindani Nzama</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;margin:0;padding:24px;background:#fff;color:#111;max-width:900px;margin:0 auto}
        h1{font-size:24px;margin-bottom:4px}p.sub{color:#666;font-size:13px;margin-bottom:24px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
        .card{border:1px solid #e5e7eb;border-radius:10px;padding:14px}
        .card .label{font-size:12px;color:#666;margin-bottom:4px}
        .card .val{font-size:20px;font-weight:700}
        h2{font-size:15px;font-weight:600;margin:0 0 10px}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#888;border-bottom:2px solid #e5e7eb;padding:8px 10px;text-align:left}
        td{font-size:13px;padding:8px 10px;border-bottom:1px solid #f3f4f6}
        tr:last-child td{border-bottom:none}
        .footer{font-size:11px;color:#aaa;text-align:center;margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb}
        @media print{body{padding:0}button{display:none}}
      </style></head><body>
      <h1>Financial Report 2026</h1>
      <p class="sub">Lindani Nzama · Generated ${new Date().toLocaleDateString('en-IE',{day:'numeric',month:'long',year:'numeric'})}</p>
      <div class="grid">
        <div class="card"><div class="label">YTD Income</div><div class="val" style="color:#10B981">${fmt(ytdIncome)}</div></div>
        <div class="card"><div class="label">YTD Expenses</div><div class="val" style="color:#F43F5E">${fmt(ytdExpenses)}</div></div>
        <div class="card"><div class="label">YTD Savings</div><div class="val" style="color:#7C3AED">${fmt(ytdSavings)}</div></div>
        <div class="card"><div class="label">Savings Rate</div><div class="val">${((ytdSavings/ytdIncome)*100).toFixed(1)}%</div></div>
      </div>
      <h2>Monthly Breakdown</h2>
      <table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th><th>Savings Rate</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>Top Spending Categories (YTD)</h2>
      <table><thead><tr><th>Category</th><th>Amount</th><th>% of Expenses</th></tr></thead><tbody>${cats}</tbody></table>
      <div class="footer">Lindani Nzama Financial Assistant · Confidential</div>
      </body></html>`;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Reports</h1>
          <p className="text-slate-400 text-sm mt-0.5">Year-to-date analysis — 2026</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-primary flex items-center gap-2 text-sm">
            <FileText size={14} /> Print PDF
          </button>
        </div>
      </div>

      {/* YTD Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'YTD Income', value: formatCurrency(ytdIncome), color: '#10B981', icon: TrendingUp },
          { label: 'YTD Expenses', value: formatCurrency(ytdExpenses), color: '#F43F5E', icon: TrendingDown },
          { label: 'YTD Savings', value: formatCurrency(ytdSavings), color: '#A855F7', icon: FileText },
          { label: 'Savings Rate', value: `${((ytdSavings / ytdIncome) * 100).toFixed(1)}%`, color: '#06B6D4', icon: FileText },
        ].map(item => (
          <div key={item.label} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{item.label}</span>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">Monthly Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v / 1000}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
            <Bar dataKey="income" name="Income" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Savings trend + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">Net Savings per Month</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2038" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: '#1A1A2E', border: '1px solid #2D2D50', borderRadius: '10px' }} />
              <Line type="monotone" dataKey="net" name="Net" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-white font-semibold mb-4">YTD Spending by Category</h2>
          <div className="flex gap-4">
            <ResponsiveContainer width="40%" height={180}>
              <PieChart>
                <Pie data={ytdCategories.slice(0, 7)} cx="50%" cy="50%" innerRadius={35} outerRadius={68} dataKey="value" paddingAngle={2}>
                  {ytdCategories.slice(0, 7).map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 overflow-hidden">
              {ytdCategories.slice(0, 7).map(c => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-400 flex-1 truncate">{c.name}</span>
                  <span className="text-slate-200 font-medium">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[#1E2038]">
          <h2 className="text-white font-semibold">Monthly Breakdown Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500 border-b border-[#1E2038] bg-[#0A0A14]">
                <th className="text-left px-4 py-3">Month</th>
                <th className="text-right px-4 py-3">Income</th>
                <th className="text-right px-4 py-3">Expenses</th>
                <th className="text-right px-4 py-3">Net</th>
                <th className="text-right px-4 py-3">Savings Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, i) => {
                const rate = row.income > 0 ? ((row.net / row.income) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={i} className="border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-200">{row.fullMonth}</td>
                    <td className="px-4 py-3 text-sm text-emerald-400 text-right font-medium">{formatCurrency(row.income)}</td>
                    <td className="px-4 py-3 text-sm text-rose-400 text-right font-medium">{formatCurrency(row.expenses)}</td>
                    <td className={`px-4 py-3 text-sm text-right font-bold ${row.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        parseFloat(rate) >= 15 ? 'badge-green' : parseFloat(rate) >= 5 ? 'badge-yellow' : 'badge-red'
                      }`}>{rate}%</span>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#0A0A14] border-t border-[#1E2038]">
                <td className="px-4 py-3 text-sm font-bold text-white">YTD Total</td>
                <td className="px-4 py-3 text-sm font-bold text-emerald-400 text-right">{formatCurrency(ytdIncome)}</td>
                <td className="px-4 py-3 text-sm font-bold text-rose-400 text-right">{formatCurrency(ytdExpenses)}</td>
                <td className={`px-4 py-3 text-sm font-bold text-right ${ytdSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ytdSavings >= 0 ? '+' : ''}{formatCurrency(ytdSavings)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="badge-purple text-xs">{((ytdSavings / ytdIncome) * 100).toFixed(1)}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Averages summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Avg Monthly Income</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(avgMonthlyIncome)}</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Avg Monthly Expenses</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(avgMonthlyExpenses)}</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Avg Monthly Net</div>
          <div className={`text-2xl font-bold mt-1 ${avgMonthlyIncome - avgMonthlyExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(avgMonthlyIncome - avgMonthlyExpenses)}
          </div>
        </div>
      </div>
    </div>
  );
}
