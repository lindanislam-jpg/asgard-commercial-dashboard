import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, CreditCard, PieChart, Target,
  TrendingDown, Receipt, RefreshCw, BarChart3, MessageSquare,
  FileText, Calendar, Moon, Sun, Menu, X, Wallet, ChevronRight
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../utils';

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
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useStore();
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
            <div className="text-white font-bold text-sm leading-tight">Asgard Finance</div>
            <div className="text-slate-500 text-xs">Personal Money OS</div>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              LI
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
