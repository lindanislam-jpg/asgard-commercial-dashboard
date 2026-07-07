import { useState, useMemo } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, CreditCard, PieChart, Target,
  TrendingDown, Receipt, RefreshCw, BarChart3, MessageSquare,
  FileText, Calendar, Moon, Sun, Menu, X, Wallet, ChevronRight,
  Bell, Shield, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils';
import { AppNotification } from '../types';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/income', label: 'Income', icon: TrendingUp },
  { path: '/expenses', label: 'Expenses', icon: CreditCard },
  { path: '/budget', label: 'Budget', icon: PieChart },
  { path: '/savings', label: 'Savings Goals', icon: Target },
  { path: '/cashflow', label: 'Cash Flow', icon: TrendingDown },
  { path: '/bills', label: 'Bills', icon: Receipt },
  { path: '/subscriptions', label: 'Subscriptions', icon: RefreshCw },
  { path: '/networth', label: 'Net Worth', icon: BarChart3 },
  { path: '/emergency', label: 'Emergency Fund', icon: Shield },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
];

function useSmartNotifications(): AppNotification[] {
  const { transactions, bills, savingsGoals, budgets, dismissedNotifications } = useStore();
  return useMemo(() => {
    const notes: AppNotification[] = [];
    const thisMonth = '2026-07';
    const today = 7;

    const expByCat: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth))
      .forEach(t => { expByCat[t.category] = (expByCat[t.category] || 0) + Math.abs(t.amount); });

    budgets.forEach(b => {
      const spent = expByCat[b.category] || 0;
      const pct = b.budgeted > 0 ? (spent / b.budgeted) * 100 : 0;
      if (pct >= 100) {
        notes.push({ id: `over_${b.category}`, type: 'danger', title: `${b.category} budget exceeded`, message: `Spent €${spent.toFixed(0)} of €${b.budgeted} (${pct.toFixed(0)}%)`, createdAt: '' });
      } else if (pct >= 80) {
        notes.push({ id: `warn_${b.category}`, type: 'warning', title: `${b.category} at ${pct.toFixed(0)}%`, message: `€${(b.budgeted - spent).toFixed(0)} remaining this month`, createdAt: '' });
      }
    });

    bills.filter(b => !b.paid && b.dueDay >= today && b.dueDay <= today + 5).forEach(b => {
      notes.push({ id: `bill_${b.id}`, type: 'warning', title: `${b.name} due on ${b.dueDay}th`, message: `€${b.amount} payment due soon`, createdAt: '' });
    });

    savingsGoals.forEach(g => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      if (pct >= 100) {
        notes.push({ id: `goal_done_${g.id}`, type: 'success', title: `${g.name} goal reached!`, message: `You've hit €${g.targetAmount.toLocaleString()} — well done!`, createdAt: '' });
      } else if (pct >= 75 && pct < 100) {
        notes.push({ id: `goal_75_${g.id}`, type: 'info', title: `${g.name} is 75%+ funded`, message: `€${(g.targetAmount - g.currentAmount).toFixed(0)} to go`, createdAt: '' });
      }
    });

    return notes.filter(n => !dismissedNotifications.includes(n.id));
  }, [transactions, bills, savingsGoals, budgets, dismissedNotifications]);
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { darkMode, toggleDarkMode, dismissNotification } = useStore();
  const notifications = useSmartNotifications();
  const location = useLocation();

  const currentPage = NAV_ITEMS.find(n =>
    n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path) && n.path !== '/'
  ) || NAV_ITEMS[0];

  return (
    <div className={cn('flex h-screen overflow-hidden', darkMode ? 'dark' : '')}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-50 w-64 flex flex-col',
        'bg-[#0D0D1A] border-r border-[#1E2038]',
        'transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1E2038]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
            <Wallet size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Lindani Nzama</div>
            <div className="text-slate-500 text-xs">Financial Assistant</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-500 hover:text-slate-300 lg:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Main Menu</div>
          {NAV_ITEMS.slice(0, 5).map(item => (
            <NavItem key={item.path} item={item} onClick={() => setSidebarOpen(false)} />
          ))}

          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2 mt-5">Financial Tools</div>
          {NAV_ITEMS.slice(5, 9).map(item => (
            <NavItem key={item.path} item={item} onClick={() => setSidebarOpen(false)} />
          ))}

          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2 mt-5">More</div>
          {NAV_ITEMS.slice(9).map(item => (
            <NavItem key={item.path} item={item} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-4 py-4 border-t border-[#1E2038]">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                       bg-[#12121E] hover:bg-[#1C1C30] border border-[#1E2038]
                       text-slate-400 hover:text-slate-200 transition-all duration-200 text-sm"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-4 px-4 lg:px-6 border-b border-[#1E2038] bg-[#0A0A14]/95 backdrop-blur-sm sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-slate-200 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>Finance</span>
            <ChevronRight size={13} />
            <span className="text-slate-200 font-medium">{currentPage.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setBellOpen(o => !o)}
                className="relative w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-10 w-80 bg-[#12121E] border border-[#1E2038] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2038]">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      {notifications.length > 0 && (
                        <span className="text-xs text-violet-400">{notifications.length} active</span>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-sm">All caught up!</div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map(n => {
                          const Icon = n.type === 'danger' || n.type === 'warning' ? AlertTriangle : n.type === 'success' ? CheckCircle : Info;
                          const color = n.type === 'danger' ? '#F43F5E' : n.type === 'warning' ? '#F59E0B' : n.type === 'success' ? '#10B981' : '#06B6D4';
                          return (
                            <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#1E2038] last:border-0 hover:bg-[#1C1C30] transition-colors">
                              <Icon size={15} style={{ color }} className="flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-200">{n.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                              </div>
                              <button
                                onClick={() => dismissNotification(n.id)}
                                className="text-slate-600 hover:text-slate-400 flex-shrink-0"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              LN
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A14]">
          <div className="p-4 lg:p-6 animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ item, onClick }: { item: typeof NAV_ITEMS[0]; onClick: () => void }) {
  return (
    <NavLink
      to={item.path}
      end={item.exact}
      onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5',
        'transition-all duration-150 group',
        isActive
          ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-[#1C1C30]'
      )}
    >
      {({ isActive }) => (
        <>
          <item.icon size={16} className={isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'} />
          {item.label}
          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
        </>
      )}
    </NavLink>
  );
}
