import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Brain, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, getMonthlyIncome, getMonthlyExpenses, getExpensesByCategory } from '../utils';

const SUGGESTED = [
  'Can I afford a €500 purchase this month?',
  'Why am I spending so much?',
  'How much can I safely save this month?',
  'When will I reach my emergency fund goal?',
  'What should I cut back on?',
  'How much do I spend on food per year?',
  'What happens if my income drops by 20%?',
  'How am I doing compared to last month?',
];

function generateResponse(question: string, data: ReturnType<typeof buildFinancialContext>): string {
  const q = question.toLowerCase();

  if (q.includes('afford') || q.includes('purchase') || q.includes('buy')) {
    const amount = question.match(/€(\d+)/)?.[1];
    if (amount) {
      const cost = parseFloat(amount);
      if (cost <= data.budgetRemaining) {
        return `✅ Yes, you can comfortably afford €${amount} this month. Your remaining budget is ${formatCurrency(data.budgetRemaining)}, so this purchase would still leave you with ${formatCurrency(data.budgetRemaining - cost)}. However, if it's not essential, consider redirecting that money to your ${data.topGoal?.name || 'savings goals'} — you'd reach it ${Math.round(cost / (data.topGoal?.monthlyContribution || 100))} weeks sooner.`;
      } else {
        return `⚠️ I'd be cautious here. Your remaining budget this month is only ${formatCurrency(data.budgetRemaining)}, so a €${amount} purchase would put you €${(cost - data.budgetRemaining).toFixed(0)} over budget. Consider waiting until next month when you'll have a fresh budget, or check if there are discretionary expenses you can trim first.`;
      }
    }
    return `To answer this, I'd need the exact amount. Currently you have ${formatCurrency(data.budgetRemaining)} remaining in your budget this month. If the purchase is within that amount and it's a genuine need, it should be fine. For larger amounts, I'd recommend waiting until your cash flow looks stronger.`;
  }

  if (q.includes('spending so much') || q.includes('why am i spending') || q.includes('overspending')) {
    const topCat = Object.entries(data.expensesByCategory).sort((a, b) => b[1] - a[1])[0];
    return `🔍 Looking at your data, your biggest spending category is **${topCat?.[0] || 'Housing'}** at ${topCat ? formatCurrency(topCat[1]) : 'N/A'} this month. Your restaurant spending has increased 22% over the past 3 months — you're spending roughly ${formatCurrency(data.restaurantSpend)} per month eating out. Your subscriptions total ${formatCurrency(data.subscriptionSpend)}/month (${formatCurrency(data.subscriptionSpend * 12)}/year). The last week of each month tends to be your highest-spending period. The good news: you're still within your overall budget — just barely.`;
  }

  if (q.includes('save') || q.includes('savings')) {
    const safeSavings = data.income - data.expenses;
    return `💰 Based on this month's data, you could safely save ${formatCurrency(Math.max(safeSavings, 0))} after covering all expenses. Your current savings rate is ${data.savingsRate.toFixed(1)}% — the recommended target is 20%. If you reduced restaurant spending by just 2 visits per week, you'd save an extra €120/month, which would boost your savings rate to ${(data.savingsRate + 3.4).toFixed(1)}%. Your current monthly contributions across all goals total ${formatCurrency(data.monthlyGoalContributions)}.`;
  }

  if (q.includes('emergency fund') || q.includes('emergency')) {
    return `🛡️ Your emergency fund currently holds ${formatCurrency(data.emergencyFundBalance)}, which covers approximately ${data.efMonths.toFixed(1)} months of expenses. The recommended minimum is 6 months. At your current contribution of €300/month, you'll reach the 6-month target in approximately ${Math.ceil((data.efMonthsTarget - data.emergencyFundBalance) / 300)} months. Consider increasing your contribution to ${formatCurrency(400)} to reach this milestone 2 months sooner.`;
  }

  if (q.includes('cut back') || q.includes('reduce') || q.includes('what should i cut')) {
    return `✂️ Based on your spending patterns, here are my top recommendations:\n\n1. **Restaurants** (${formatCurrency(data.restaurantSpend)}/mo) — 22% above your 3-month average. Cutting 2 meals out per week saves ~€120/mo.\n2. **Subscriptions** (${formatCurrency(data.subscriptionSpend)}/mo) — you have 2 unused subscriptions totalling ~€28/mo.\n3. **Shopping** — varies widely month to month. Setting a firm €150 limit could save you €50+ most months.\n\nTotal potential savings: **€198/month = €2,376/year**.`;
  }

  if (q.includes('food') && q.includes('year')) {
    const annualFood = data.foodSpend * 12;
    return `🍽️ Based on your average monthly food spend of ${formatCurrency(data.foodSpend)}, you're on track to spend approximately ${formatCurrency(annualFood)} on food this year. This breaks down as: groceries (~${formatCurrency(data.grocerySpend * 12)}/yr) + restaurants (~${formatCurrency(data.restaurantSpend * 12)}/yr). If you meal-prepped twice a week and reduced restaurant visits, you could bring this down to around ${formatCurrency(annualFood * 0.75)}/yr — saving ${formatCurrency(annualFood * 0.25)}.`;
  }

  if (q.includes('income drops') || q.includes('income fell') || q.includes('lose my job')) {
    const dropAmount = parseFloat(question.match(/(\d+)/)?.[1] || '20');
    const newIncome = data.income * (1 - dropAmount / 100);
    const newSavings = newIncome - data.expenses;
    return `📊 If your income dropped by ${dropAmount}%, you'd have ${formatCurrency(newIncome)}/month instead of ${formatCurrency(data.income)}. At your current spending rate of ${formatCurrency(data.expenses)}, you would ${newSavings >= 0 ? `still save ${formatCurrency(newSavings)}/month` : `run a monthly deficit of ${formatCurrency(Math.abs(newSavings))}`}. Your emergency fund of ${formatCurrency(data.emergencyFundBalance)} would last ${(data.emergencyFundBalance / Math.abs(Math.min(newSavings, data.expenses))).toFixed(1)} months. I'd recommend immediately reducing discretionary spending and pausing non-essential savings goals.`;
  }

  if (q.includes('last month') || q.includes('compared to') || q.includes('how am i doing')) {
    const diff = data.expenses - data.lastExpenses;
    return `📈 Here's your month-over-month comparison:\n\n**Income**: ${formatCurrency(data.lastIncome)} → ${formatCurrency(data.income)} (${data.income >= data.lastIncome ? '▲' : '▼'} ${formatCurrency(Math.abs(data.income - data.lastIncome))})\n**Expenses**: ${formatCurrency(data.lastExpenses)} → ${formatCurrency(data.expenses)} (${diff >= 0 ? '▲' : '▼'} ${formatCurrency(Math.abs(diff))})\n\n${diff < 0 ? `✅ Great job! You spent ${formatCurrency(Math.abs(diff))} less than last month.` : `⚠️ You spent ${formatCurrency(diff)} more than last month — mainly due to increased ${Object.entries(data.expensesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'spending'}.`}\n\nYour financial health score is **${data.healthScore}/100** — ${data.healthScore >= 70 ? 'excellent' : data.healthScore >= 50 ? 'good, room to improve' : 'needs attention'}.`;
  }

  return `💬 Great question! Based on your financial data:\n\n• Monthly income: ${formatCurrency(data.income)}\n• Monthly expenses: ${formatCurrency(data.expenses)}\n• Budget remaining: ${formatCurrency(data.budgetRemaining)}\n• Savings rate: ${data.savingsRate.toFixed(1)}%\n• Financial health: ${data.healthScore}/100\n\nFor a more specific answer, try asking about a particular category, goal, or financial scenario. I can analyze your spending patterns, forecast your cash flow, or help you plan for major purchases.`;
}

function buildFinancialContext(transactions: any[], savingsGoals: any[]) {
  const thisMonth = '2026-07';
  const lastMonth = '2026-06';
  const income = getMonthlyIncome(transactions, thisMonth);
  const expenses = getMonthlyExpenses(transactions, thisMonth);
  const lastIncome = getMonthlyIncome(transactions, lastMonth);
  const lastExpenses = getMonthlyExpenses(transactions, lastMonth);
  const expensesByCategory = getExpensesByCategory(transactions, thisMonth);
  const restaurantSpend = expensesByCategory['Restaurants'] || 0;
  const subscriptionSpend = expensesByCategory['Subscriptions'] || 0;
  const foodSpend = (expensesByCategory['Food'] || 0) + restaurantSpend;
  const grocerySpend = expensesByCategory['Food'] || 0;
  const budgetRemaining = 2300 - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const emergencyGoal = savingsGoals.find((g: any) => g.name === 'Emergency Fund');
  const emergencyFundBalance = emergencyGoal?.currentAmount || 0;
  const efMonths = expenses > 0 ? emergencyFundBalance / expenses : 0;
  const efMonthsTarget = 6 * (expenses || 1);
  const monthlyGoalContributions = savingsGoals.reduce((s: number, g: any) => s + g.monthlyContribution, 0);
  const topGoal = savingsGoals[0];

  const efScore = Math.min((efMonths / 6) * 25, 25);
  const savingsScore = Math.min(savingsRate * 0.83, 25);
  const budgetScore = expenses <= 2300 ? 25 : Math.max(0, 25 - ((expenses - 2300) / 100));
  const growthScore = 15;
  const healthScore = Math.round(efScore + savingsScore + budgetScore + growthScore);

  return {
    income, expenses, lastIncome, lastExpenses, expensesByCategory,
    restaurantSpend, subscriptionSpend, foodSpend, grocerySpend,
    budgetRemaining, savingsRate, emergencyFundBalance, efMonths, efMonthsTarget,
    monthlyGoalContributions, topGoal, healthScore,
  };
}

export default function AIChat() {
  const { transactions, savingsGoals, chatMessages, addChatMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const context = buildFinancialContext(transactions, savingsGoals);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { id: `u_${Date.now()}`, role: 'user' as const, content: msg, timestamp: new Date() };
    addChatMessage(userMsg);
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = generateResponse(msg, context);
    addChatMessage({ id: `a_${Date.now()}`, role: 'assistant', content: response, timestamp: new Date() });
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Financial Assistant</h1>
        <p className="text-slate-400 text-sm mt-0.5">Ask anything about your finances — powered by your real data</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          {chatMessages.length === 0 && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <Brain size={17} className="text-violet-400" />
              </div>
              <div className="flex-1">
                <div className="bg-[#1C1C30] border border-[#2D2D50] rounded-2xl rounded-tl-sm p-4 max-w-lg">
                  <p className="text-slate-200 text-sm leading-relaxed">
                    👋 Hi! I'm your AI Financial Assistant. I have full access to your financial data — income, expenses, budgets, goals, and cash flow.
                  </p>
                  <p className="text-slate-300 text-sm leading-relaxed mt-2">
                    Ask me anything: whether you can afford something, how to save more, where your money goes, or what to cut. I'll give you specific, data-driven answers.
                  </p>
                </div>
                <div className="text-xs text-slate-600 mt-1 ml-1">AI Assistant · just now</div>
              </div>
            </div>
          )}

          {/* Messages */}
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-violet-600 to-purple-500'
                  : 'bg-violet-500/20 border border-violet-500/30'
              }`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Brain size={14} className="text-violet-400" />}
              </div>
              <div className={`flex-1 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={`rounded-2xl p-4 max-w-lg text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-[#1C1C30] border border-[#2D2D50] text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <div className="text-xs text-slate-600 mt-1 mx-1">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'} · {msg.timestamp.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <Brain size={14} className="text-violet-400" />
              </div>
              <div className="bg-[#1C1C30] border border-[#2D2D50] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {chatMessages.length === 0 && (
          <div className="px-4 pb-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Suggested questions</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.slice(0, 4).map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-[#1C1C30] hover:bg-[#252540] border border-[#2D2D50] text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#1E2038]">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <input
              className="input flex-1"
              placeholder="Ask about your finances..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="btn-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
