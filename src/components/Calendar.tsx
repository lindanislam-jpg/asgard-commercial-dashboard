import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type CalendarEvent = {
  day: number;
  label: string;
  type: 'payday' | 'bill' | 'savings' | 'transaction';
  amount?: number;
  color: string;
};

export default function Calendar() {
  const { bills, transactions } = useStore();
  const [viewDate, setViewDate] = useState(new Date(2026, 6, 1)); // July 2026

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const events = useMemo((): CalendarEvent[] => {
    const evts: CalendarEvent[] = [];

    // Payday
    evts.push({ day: 3, label: '💼 Payday', type: 'payday', amount: 3500, color: '#10B981' });

    // Bills
    bills.forEach(b => {
      if (b.dueDay <= daysInMonth) {
        evts.push({ day: b.dueDay, label: `${b.icon} ${b.name}`, type: 'bill', amount: b.amount, color: b.paid ? '#475569' : '#F43F5E' });
      }
    });

    // Savings transfer
    evts.push({ day: 5, label: '💰 Savings Transfer', type: 'savings', amount: 350, color: '#A855F7' });

    // Current month transactions
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    transactions
      .filter(t => t.date.startsWith(monthKey))
      .forEach(t => {
        const day = parseInt(t.date.split('-')[2]);
        evts.push({
          day,
          label: t.description.length > 20 ? t.description.slice(0, 20) + '…' : t.description,
          type: 'transaction',
          amount: t.amount,
          color: t.type === 'income' ? '#10B981' : '#64748B',
        });
      });

    return evts;
  }, [bills, transactions, year, month, daysInMonth]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    events.forEach(e => {
      if (!map[e.day]) map[e.day] = [];
      map[e.day].push(e);
    });
    return map;
  }, [events]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const unpaidBills = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Calendar</h1>
        <p className="text-slate-400 text-sm mt-0.5">Bills, income, and financial events</p>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Monthly Bills</div>
          <div className="text-2xl font-bold text-white mt-1">{formatCurrency(totalBills)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{bills.length} bills total</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Still to Pay</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{formatCurrency(unpaidBills)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{bills.filter(b => !b.paid).length} unpaid</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Next Payday</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">Aug 3</div>
          <div className="text-xs text-slate-500 mt-0.5">27 days away</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-400 text-sm">Transactions</div>
          <div className="text-2xl font-bold text-white mt-1">
            {transactions.filter(t => t.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">This month</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card overflow-hidden">
        {/* Navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2038]">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-lg bg-[#1C1C30] border border-[#2D2D50] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <h2 className="text-white font-semibold">{monthName}</h2>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-lg bg-[#1C1C30] border border-[#2D2D50] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#1E2038]">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-[#1E2038] bg-[#0A0A14]/30" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = eventsByDay[day] || [];
            const isToday = isCurrentMonth && today.getDate() === day;
            const colIndex = (startOffset + i) % 7;
            const isWeekend = colIndex >= 5;

            return (
              <div
                key={day}
                className={`min-h-[90px] border-b border-r border-[#1E2038] p-1.5 transition-colors hover:bg-[#1C1C30]
                  ${isWeekend ? 'bg-[#0D0D1A]' : ''}
                  ${(startOffset + i) % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isToday ? 'bg-violet-600 text-white' : 'text-slate-400'
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents
                    .filter(e => e.type !== 'transaction')
                    .slice(0, 3)
                    .map((evt, j) => (
                      <div
                        key={j}
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium truncate"
                        style={{ background: `${evt.color}18`, color: evt.color, border: `1px solid ${evt.color}25` }}
                      >
                        {evt.label}
                      </div>
                    ))}
                  {dayEvents.filter(e => e.type === 'transaction').length > 0 && (
                    <div className="text-[10px] text-slate-500 px-1">
                      +{dayEvents.filter(e => e.type === 'transaction').length} txn{dayEvents.filter(e => e.type === 'transaction').length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">Upcoming Events This Month</h2>
        <div className="space-y-2">
          {[
            { day: 5, label: 'Netflix', amount: -15.99, icon: '🎬', color: '#F43F5E' },
            { day: 5, label: 'Spotify', amount: -9.99, icon: '🎵', color: '#F43F5E' },
            { day: 10, label: 'Car Insurance', amount: -95, icon: '🚗', color: '#F43F5E' },
            { day: 10, label: 'Health Insurance', amount: -55, icon: '❤️', color: '#F43F5E' },
            { day: 15, label: 'Electricity', amount: -65, icon: '⚡', color: '#F43F5E' },
            { day: 15, label: 'Gas', amount: -45, icon: '🔥', color: '#F43F5E' },
            { day: 20, label: 'Internet', amount: -35, icon: '📡', color: '#F43F5E' },
            { day: 22, label: 'Gym', amount: -35, icon: '💪', color: '#F43F5E' },
            { day: 22, label: 'Phone', amount: -45, icon: '📱', color: '#F43F5E' },
          ].filter(e => e.day > 7).sort((a, b) => a.day - b.day).map((evt, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1C1C30] border border-[#2D2D50] flex items-center justify-center text-sm">
                {evt.icon}
              </div>
              <div className="flex-1">
                <span className="text-sm text-slate-200">{evt.label}</span>
              </div>
              <span className="text-xs text-slate-500">Jul {evt.day}</span>
              <span className="text-sm font-semibold text-rose-400">{formatCurrency(Math.abs(evt.amount))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
