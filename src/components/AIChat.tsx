import { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { Send, Brain, User, Key, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
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

function buildFinancialContext(transactions: any[], savingsGoals: any[], bills: any[], netWorthItems: any[]) {
  const thisMonth = '2026-07';
  const lastMonth = '2026-06';

  const income = getMonthlyIncome(transactions, thisMonth);
  const expenses = getMonthlyExpenses(transactions, thisMonth);
  const lastIncome = getMonthlyIncome(transactions, lastMonth);
  const lastExpenses = getMonthlyExpenses(transactions, lastMonth);
  const expensesByCategory = getExpensesByCategory(transactions, thisMonth);

  const totalAssets = netWorthItems.filter((n: any) => n.itemType === 'asset').reduce((s: number, n: any) => s + n.amount, 0);
  const totalLiabilities = netWorthItems.filter((n: any) => n.itemType === 'liability').reduce((s: number, n: any) => s + n.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  const emergencyGoal = savingsGoals.find((g: any) => g.name === 'Emergency Fund');
  const totalSavings = savingsGoals.reduce((s: number, g: any) => s + g.currentAmount, 0);

  const unpaidBills = bills.filter((b: any) => !b.paid);
  const totalBillsDue = unpaidBills.reduce((s: number, b: any) => s + b.amount, 0);

  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  ['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07'].forEach(m => {
    monthlyData[m] = {
      income: getMonthlyIncome(transactions, m),
      expenses: getMonthlyExpenses(transactions, m),
    };
  });

  const recentTransactions = [...transactions]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)
    .map((t: any) => `${t.date} | ${t.type === 'income' ? '+' : '-'}€${Math.abs(t.amount).toFixed(2)} | ${t.category} | ${t.description}`);

  return `
You are Lindani Nzama's personal AI financial assistant. You have full access to their real financial data. Be specific, honest, and helpful. Use exact numbers from the data. Keep responses concise and actionable.

=== CURRENT MONTH (July 2026) ===
Income: €${income.toFixed(2)}
Expenses: €${expenses.toFixed(2)}
Net: €${(income - expenses).toFixed(2)}
Savings rate: ${income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0}%
Budget remaining: €${(2300 - expenses).toFixed(2)} (budget is €2,300/mo)

=== LAST MONTH (June 2026) ===
Income: €${lastIncome.toFixed(2)}
Expenses: €${lastExpenses.toFixed(2)}

=== MONTHLY HISTORY ===
${Object.entries(monthlyData).map(([m, d]) => `${m}: Income €${d.income.toFixed(0)}, Expenses €${d.expenses.toFixed(0)}, Net €${(d.income - d.expenses).toFixed(0)}`).join('\n')}

=== SPENDING BY CATEGORY (July) ===
${Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `${cat}: €${(amt as number).toFixed(2)}`).join('\n')}

=== SAVINGS GOALS ===
${savingsGoals.map((g: any) => `${g.name}: €${g.currentAmount.toFixed(0)} of €${g.targetAmount.toFixed(0)} (${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}%) — €${g.monthlyContribution}/mo`).join('\n')}

=== NET WORTH ===
Total Assets: €${totalAssets.toFixed(2)}
Total Liabilities: €${totalLiabilities.toFixed(2)}
Net Worth: €${netWorth.toFixed(2)}

=== UPCOMING BILLS ===
${unpaidBills.map((b: any) => `${b.name}: €${b.amount} due ${b.dueDay}th`).join('\n')}
Total still to pay this month: €${totalBillsDue.toFixed(2)}

=== RECENT TRANSACTIONS (latest 20) ===
${recentTransactions.join('\n')}

=== EMERGENCY FUND ===
Current: €${emergencyGoal?.currentAmount.toFixed(0) || 0}
Target: €${emergencyGoal?.targetAmount.toFixed(0) || 10000}
Months covered: ${expenses > 0 ? ((emergencyGoal?.currentAmount || 0) / expenses).toFixed(1) : '0'}

=== TOTAL SAVINGS ACROSS ALL GOALS ===
€${totalSavings.toFixed(2)}
`.trim();
}

export default function AIChat() {
  const { transactions, savingsGoals, bills, netWorthItems, chatMessages, addChatMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasKey = !!apiKey;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const saveKey = () => {
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith('sk-')) {
      setError('Invalid key — OpenAI keys start with "sk-"');
      return;
    }
    localStorage.setItem('openai_api_key', trimmed);
    setApiKey(trimmed);
    setKeyInput('');
    setShowKeyForm(false);
    setError('');
  };

  const removeKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
  };

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !hasKey) return;
    setInput('');
    setError('');

    const userMsg = { id: `u_${Date.now()}`, role: 'user' as const, content: msg, timestamp: new Date() };
    addChatMessage(userMsg);
    setIsTyping(true);

    const systemPrompt = buildFinancialContext(transactions, savingsGoals, bills, netWorthItems);

    try {
      const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const history = chatMessages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: msg },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      addChatMessage({ id: `a_${Date.now()}`, role: 'assistant', content: reply, timestamp: new Date() });
    } catch (err: any) {
      const message = err?.message || 'Unknown error';
      if (message.includes('401') || message.includes('Incorrect API key')) {
        setError('Invalid API key. Please check and update it.');
      } else if (message.includes('429')) {
        setError('Rate limit reached. Wait a moment and try again.');
      } else {
        setError(`Error: ${message}`);
      }
      addChatMessage({
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: '⚠️ There was an issue reaching OpenAI. Please check your API key and try again.',
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Financial Assistant</h1>
          <p className="text-slate-400 text-sm mt-0.5">Powered by GPT-4o · uses your real financial data</p>
        </div>

        {/* API key status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasKey ? (
            <div className="flex items-center gap-2">
              <span className="badge-green flex items-center gap-1.5"><Key size={10} /> GPT-4o connected</span>
              <button onClick={() => { setShowKeyForm(true); setKeyInput(''); }} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">change</button>
              <button onClick={removeKey} className="text-xs text-slate-500 hover:text-rose-400 transition-colors">remove</button>
            </div>
          ) : (
            <button
              onClick={() => setShowKeyForm(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Key size={14} /> Add OpenAI Key
            </button>
          )}
        </div>
      </div>

      {/* API Key form */}
      {showKeyForm && (
        <div className="card p-4 mb-4 border-violet-500/20">
          <div className="text-sm font-semibold text-white mb-2">OpenAI API Key</div>
          <p className="text-xs text-slate-400 mb-3">
            Get your key at <span className="text-violet-400">platform.openai.com/api-keys</span>. It's stored only in your browser (localStorage) and never sent anywhere except directly to OpenAI.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input pr-10"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={keyInput}
                onChange={e => { setKeyInput(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button onClick={saveKey} className="btn-primary px-4">Save</button>
            <button onClick={() => { setShowKeyForm(false); setError(''); }} className="btn-secondary px-4">Cancel</button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-xs text-rose-400">
              <AlertCircle size={12} /> {error}
            </div>
          )}
        </div>
      )}

      {/* No key state */}
      {!hasKey && !showKeyForm && (
        <div className="card p-8 flex flex-col items-center justify-center gap-4 text-center flex-1">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Key size={28} className="text-violet-400" />
          </div>
          <div>
            <div className="text-white font-semibold text-lg">Connect OpenAI to get started</div>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              Add your OpenAI API key to start chatting with GPT-4o about your finances. Your key is stored locally in your browser.
            </p>
          </div>
          <button onClick={() => setShowKeyForm(true)} className="btn-primary flex items-center gap-2">
            <Key size={16} /> Add API Key
          </button>
        </div>
      )}

      {/* Chat area */}
      {hasKey && (
        <div className="flex-1 card overflow-hidden flex flex-col min-h-0">
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
                      👋 Hi Lindani! I'm your AI Financial Assistant, powered by GPT-4o. I have full access to your financial data — income, expenses, budgets, savings goals, bills, and net worth.
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed mt-2">
                      Ask me anything: whether you can afford something, how to save more, where your money goes, or what the next smart move is.
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 ml-1">GPT-4o · just now</div>
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
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Brain size={14} className="text-violet-400" />}
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
                    {msg.role === 'user' ? 'You' : 'GPT-4o'} · {msg.timestamp.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
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
            <div className="px-4 pb-3 border-t border-[#1E2038] pt-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles size={11} /> Suggested questions
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-[#1C1C30] hover:bg-[#252540] border border-[#2D2D50] text-slate-300 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error bar */}
          {error && !showKeyForm && (
            <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle size={12} /> {error}
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
      )}
    </div>
  );
}
