import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface FaqItemData {
  id: string;
  category: 'General' | 'Planning & AI' | 'Providers' | 'Accessibility & Trust';
  question: string;
  answer: string;
  highlights?: string[];
}

interface FaqAccordionItemProps {
  item: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
}

export function FaqAccordionItem({ item, isOpen, onToggle }: FaqAccordionItemProps) {
  const getCategoryColor = (cat: FaqItemData['category']) => {
    switch (cat) {
      case 'Planning & AI':
        return 'bg-marigold-50 text-marigold-800 border-marigold-200 dark:bg-marigold-950/40 dark:text-marigold-300 dark:border-marigold-800/40';
      case 'Providers':
        return 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40';
      case 'Accessibility & Trust':
        return 'bg-clay-50 text-clay-800 border-clay-200 dark:bg-clay-950/40 dark:text-clay-300 dark:border-clay-800/40';
      default:
        return 'bg-paper-200 text-ink/80 border-paper-400 dark:bg-ink-700 dark:text-paper-100 dark:border-ink-600';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'bg-white dark:bg-ink-800 border-ink/30 dark:border-marigold/40 shadow-md'
          : 'bg-white/80 dark:bg-ink-900/60 hover:bg-white dark:hover:bg-ink-800/90 border-paper-300 dark:border-ink-700/80 shadow-xs'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
      >
        <div className="space-y-1.5 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryColor(
                item.category
              )}`}
            >
              {item.category}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-display font-bold text-ink dark:text-paper-50 leading-snug">
            {item.question}
          </h3>
        </div>

        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-transform duration-300 mt-0.5 ${
            isOpen
              ? 'bg-ink text-paper border-ink rotate-180 dark:bg-marigold dark:text-ink-900 dark:border-marigold'
              : 'bg-paper-100 dark:bg-ink-700 text-ink/70 dark:text-paper-200 border-paper-300 dark:border-ink-600'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-paper-200 dark:border-ink-700/60 space-y-3">
              <p className="text-xs sm:text-sm font-sans text-dusk-700 dark:text-dusk-200 leading-relaxed">
                {item.answer}
              </p>

              {item.highlights && item.highlights.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {item.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-paper-100 dark:bg-ink-700/80 rounded-lg text-[11px] font-mono text-ink/80 dark:text-paper-200 border border-paper-300 dark:border-ink-600 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal dark:bg-teal-400" />
                      <span>{highlight}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
