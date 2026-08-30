'use client';

import React, { useState } from 'react';
import { RouteGuard } from '../../../components/RouteGuard';
import { Clock, Calendar, Check, Plus, AlertCircle } from 'lucide-react';

export default function ProviderAvailabilityPage() {
  const [slots, setSlots] = useState([
    { id: 1, day: 'Monday – Friday', time: '10:00 AM – 11:30 AM', capacity: 15, active: true },
    { id: 2, day: 'Monday – Friday', time: '03:30 PM – 05:00 PM', capacity: 15, active: true },
    { id: 3, day: 'Saturday – Sunday', time: '09:00 AM – 11:00 AM', capacity: 20, active: true },
    { id: 4, day: 'Saturday – Sunday', time: '04:00 PM – 06:00 PM', capacity: 20, active: true }
  ]);

  const [savedNotice, setSavedNotice] = useState(false);

  const toggleSlot = (id: number) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Scheduling & Capacities
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Availability & Time Slots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control when travelers can book your experiences and manage maximum group sizes per slot.
          </p>
        </div>

        {savedNotice && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Availability schedule updated successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {slot.day}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    slot.active
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {slot.active ? 'Accepting Bookings' : 'Paused'}
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{slot.time}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Maximum Capacity: {slot.capacity} guests / batch
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleSlot(slot.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  slot.active
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {slot.active ? 'Pause Slot' : 'Activate Slot'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </RouteGuard>
  );
}
