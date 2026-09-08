import React, { useState } from 'react';
import { X, Check, Pencil, Calendar, MapPin, Users, Coins, Building2 } from 'lucide-react';
import { ItineraryTripDetails } from '../../types/itinerary';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDetails: ItineraryTripDetails;
  onSave: (updated: ItineraryTripDetails) => void;
}

export function EditTripModal({
  isOpen,
  onClose,
  tripDetails,
  onSave,
}: EditTripModalProps) {
  const [formData, setFormData] = useState<ItineraryTripDetails>({ ...tripDetails });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-paper-400 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-dusk hover:text-ink rounded-full hover:bg-paper-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-teal uppercase tracking-wider flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            <span>Trip Parameters</span>
          </span>
          <h3 className="text-2xl font-display font-bold text-ink">
            Edit Trip Overview
          </h3>
          <p className="text-xs text-dusk-600 font-sans">
            Customize destination labels, travel companions, and overall budget targets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="font-bold text-ink block">Trip Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-ink block">Destination City</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-ink block">Base Hotel</label>
              <input
                type="text"
                value={formData.hotel}
                onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                placeholder="e.g. Colaba Heritage Quarter"
                className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-ink block">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-ink block">End Date</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-ink block">Number of Travelers</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.travelers}
                onChange={(e) =>
                  setFormData({ ...formData, travelers: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-ink block">Total Budget Target (₹)</label>
              <input
                type="number"
                step={500}
                value={formData.totalBudgetLimit}
                onChange={(e) =>
                  setFormData({ ...formData, totalBudgetLimit: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-sans focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-paper-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-dusk hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-ink text-paper rounded-xl font-mono text-xs font-bold hover:bg-ink-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-marigold" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
