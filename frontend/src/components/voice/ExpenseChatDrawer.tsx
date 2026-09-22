import React from 'react';
import { ExpenseMessage, ConversationState } from '../../lib/expenseConversation';
import { Receipt, CheckCircle2, User, Bot, Sparkles } from 'lucide-react';

export interface ExpenseChatDrawerProps {
  messages: ExpenseMessage[];
  state: ConversationState;
  todayTotal: number;
  onClose?: () => void;
}

export const ExpenseChatDrawer: React.FC<ExpenseChatDrawerProps> = ({
  messages,
  state,
  todayTotal,
}) => {
  // Show only last 4 messages
  const recentMessages = messages.slice(-4);

  if (recentMessages.length === 0 && state === 'IDLE') {
    return null;
  }

  return (
    <div className="mt-4 bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#C1443B]/10 flex items-center justify-center text-[#C1443B]">
            <Receipt className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-ink">
            End-of-Day Expense Log
          </span>
          {state === 'ACTIVE_SESSION' && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Session
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-dusk-600 block">
            Today's Total
          </span>
          <span className="text-sm font-mono font-bold text-[#C1443B]">
            ₹{todayTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
        {recentMessages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2 text-xs ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-5 h-5 rounded-full bg-[#FAF0E6] text-[#C1443B] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3" />
                </div>
              )}

              <div
                className={`p-2.5 rounded-xl max-w-[82%] ${
                  isUser
                    ? 'bg-ink text-white font-sans rounded-tr-none'
                    : 'bg-white text-ink border border-[#E5DFD5] rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {m.amount_inr !== undefined && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#E5DFD5] flex items-center justify-between gap-2 text-[10px] font-mono text-[#C1443B]">
                    <span className="flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Recorded +₹{m.amount_inr}
                    </span>
                    {m.category && (
                      <span className="px-1.5 py-0.2 rounded bg-[#FAF7F2] text-dusk-600 border border-[#E5DFD5]">
                        {m.category}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-5 h-5 rounded-full bg-dusk-200 text-ink flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state === 'ACTIVE_SESSION' && (
        <p className="text-[10px] font-mono text-dusk-600 text-center italic">
          Listening for next expense or say "that's all" to finish. (8s auto-save timer active)
        </p>
      )}
    </div>
  );
};
