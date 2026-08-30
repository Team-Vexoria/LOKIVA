'use client';

import React from 'react';
import { RouteGuard } from '../../../components/RouteGuard';
import { AlertTriangle, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';

export default function AdminReportsPage() {
  const reports = [
    {
      id: 'REP-201',
      experience: 'Old Delhi Midnight Street Food Crawl',
      reporter: 'Vikram Mehta',
      issue: 'Outdated opening hours listed on holiday',
      date: 'Aug 29, 2026',
      status: 'Resolved'
    },
    {
      id: 'REP-202',
      experience: 'Fort Kochi Sunset Kayaking Trail',
      reporter: 'Ananya Rao',
      issue: 'Host shifted meeting landmark by 50 meters',
      date: 'Aug 30, 2026',
      status: 'Under Review'
    }
  ];

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Safety & Feedback
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Traveler Reports & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit incident reports, inaccurate spot timings, and host quality feedback.
          </p>
        </div>

        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                    {r.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {r.experience}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'Resolved'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Issue: {r.issue}
                </div>
                <div className="text-[11px] text-slate-400">
                  Reported by {r.reporter} · {r.date}
                </div>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shrink-0"
              >
                Audit Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </RouteGuard>
  );
}
