import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Income from './components/Income';
import Expenses from './components/Expenses';
import Budget from './components/Budget';
import Savings from './components/Savings';
import CashFlow from './components/CashFlow';
import Bills from './components/Bills';
import NetWorth from './components/NetWorth';
import AIChat from './components/AIChat';
import Reports from './components/Reports';
import Calendar from './components/Calendar';
import Subscriptions from './components/Subscriptions';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Budget />} />
          <Route path="savings" element={<Savings />} />
          <Route path="cashflow" element={<CashFlow />} />
          <Route path="bills" element={<Bills />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="networth" element={<NetWorth />} />
          <Route path="chat" element={<AIChat />} />
          <Route path="reports" element={<Reports />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
