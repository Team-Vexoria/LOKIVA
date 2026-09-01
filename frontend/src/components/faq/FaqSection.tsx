import React, { useState } from 'react';
import { HelpCircle, Sparkles, Compass, ShieldCheck, RefreshCw, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FaqItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  question: string;
  answer: string;
  tags: string[];
}

const CORE_FAQS: FaqItem[] = [
  {
    id: 'how-it-works',
    icon: Compass,
    badge: 'Core Engine',
    question: 'What is LOKIVA and how does the constraint solver work?',
    answer:
      'LOKIVA is an intelligent local discovery engine that packages realistic itineraries around your available hours, location, and budget ceiling. It evaluates 11 real-world signals simultaneously — including live auto traffic isochrones, venue opening hours, and walking fatigue.',
    tags: ['11-Signal Solver', 'Real Travel Buffers', 'Hard Budget Ceiling'],
  },
  {
    id: 'ai-personalization',
    icon: Sparkles,
    badge: 'AI & Pacing',
    question: 'How does AI personalize plans for families, couples, and solo travelers?',
    answer:
      'The solver adapts to your traveler persona: adjusting walking limits for elderly explorers, prioritizing kid-friendly workshops for families, and respecting dietary choices (Jain, vegetarian) with zero sponsored ad bias.',
    tags: ['Persona Adaptation', 'Step-Free Access', 'Zero Ad Bias'],
  },
  {
    id: 'live-adaptation',
    icon: RefreshCw,
    badge: 'Live Re-Plan',
    question: 'What happens if rain hits or an experience becomes unavailable?',
    answer:
      'LOKIVA includes a 1-click Live Adaptation Loop. If monsoon rain hits or a venue closes unexpectedly, the engine dynamically re-solves your plan — swapping outdoor stops for sheltered indoor artisan ateliers while preserving your timings.',
    tags: ['1-Click Weather Re-Solve', 'Sheltered Indoor Swaps', 'Timings Preserved'],
  },
  {
    id: 'pan-india-coverage',
    icon: ShieldCheck,
    badge: 'Pan-India',
    question: 'Can I discover experiences and hidden gems across all of India?',
    answer:
      'Yes. LOKIVA provides complete coverage across all 28 Indian States and 8 Union Territories, indexing Tier 1, Tier 2, and Tier 3 cities, artisan guilds, and local heritage destinations with live discovery.',
    tags: ['36 States & UTs', 'Pan-India Network', 'Hidden Gems'],
  },
  {
    id: 'provider-hub',
    icon: Users,
    badge: 'For Artisans',
    question: 'How can local artisans and guides list their experiences?',
    answer:
      'Local master craftspeople, culinary hosts, and storytellers can join the LOKIVA Provider Hub. Our built-in AI Listing Co-Pilot creates structured listings in seconds, with 100% of traveler spend going directly to local hosts.',
    tags: ['AI Listing Co-Pilot', '100% Direct Spend', 'Host Analytics'],
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Short & Clean Light Box */}
      <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 shadow-sm space-y-4 text-ink">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-paper-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-paper-100 border border-paper-300 flex items-center justify-center text-teal flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-marigold" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold text-ink leading-snug">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-dusk-600 font-sans">
                Quick answers on our constraint solver, pan-India discovery, and dynamic adaptation.
              </p>
            </div>
          </div>

          <Link
            to="/ai-guide"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-ink hover:text-marigold transition whitespace-nowrap self-start sm:self-auto"
          >
            <span>Ask AI Concierge</span>
            <ArrowRight className="w-3.5 h-3.5 text-marigold" />
          </Link>
        </div>

        {/* Compact FAQs Accordion List */}
        <div className="space-y-2">
          {CORE_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            const Icon = faq.icon;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-paper-50 border-paper-400 shadow-xs'
                    : 'bg-paper-100/50 hover:bg-paper-100 border-paper-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                        isOpen
                          ? 'bg-ink text-marigold shadow-xs'
                          : 'bg-white text-ink/70 border border-paper-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-display font-bold text-ink truncate sm:whitespace-normal">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 flex-shrink-0 ${
                      isOpen
                        ? 'bg-ink text-paper rotate-45'
                        : 'bg-paper-200 text-ink/60 hover:bg-paper-300'
                    }`}
                  >
                    +
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="px-4 pb-4 pt-1 pl-14 sm:pl-14 space-y-2.5 border-t border-paper-200">
                        <p className="text-xs font-sans text-dusk-700 leading-relaxed">
                          {faq.answer}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {faq.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white rounded-md text-[10px] font-mono text-ink/80 border border-paper-300 flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
