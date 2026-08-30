'use client';

import React from 'react';
import { RouteGuard } from '../../../components/RouteGuard';
import { CalendarCheck, Users, Clock, CheckCircle2, Phone, Mail } from 'lucide-react';

export default function ProviderBookingsPage() {
  const bookings = [
    {
      id: 'BK-1049',
      traveler: 'Aarav Sharma',
      email: 'aarav@lokiva.demo',
      phone: '+91 98765 43210',
      pax: 4,
      experience: 'Ranwar Village Indo-Portuguese Heritage Walk & Irani Chai',
      date: 'Today, 3:30 PM',
      total_price: 1400,
      status: 'Confirmed'
    },
    {
      id: 'BK-1050',
      traveler: 'Priya Mukherjee',
      email: 'priya.m@example.com',
      phone: '+91 91234 56789',
      pax: 2,
      experience: 'Master Block Printing Workshop with 5th Gen Artisan',
      date: 'Tomorrow, 11:00 AM',
      total_price: 900,
      status: 'Confirmed'
    },
    {
      id: 'BK-1051',
      traveler: 'David Miller',
      email: 'david.m@example.com',
      phone: '+44 7911 123456',
      pax: 1,
      experience: 'Kathakali Green Room Facial Makeup Ritual & Mudra Demo',
      date: 'Sep 2, 4:00 PM',
      total_price: 350,
      status: 'Confirmed'
    }
  ];

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Reservations & Guests
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Bookings & Guest Manifest ({bookings.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time reservations and attendee details for your local workshops.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                    {b.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {b.traveler} ({b.pax} Guests)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {b.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {b.experience}
                </h4>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-orange-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{b.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{b.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{b.phone}</span>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-black text-slate-900 dark:text-slate-100">
                  ₹{b.total_price}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Paid via LOKIVA
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RouteGuard>
  );
}
