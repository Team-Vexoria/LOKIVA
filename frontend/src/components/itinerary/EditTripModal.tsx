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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26160E]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl border border-[#E6DAC6] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#3B2316]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-[#7A5C49] hover:text-[#3B2316] rounded-full hover:bg-[#FFFDF9] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-xs font-heading font-extrabold text-[#B84A27] uppercase tracking-wider flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            <span>Trip Parameters</span>
          </span>
          <h3 className="text-2xl font-display font-bold text-[#3B2316]">
            Edit Trip Overview
          </h3>
          <p className="text-xs text-[#7A5C49] font-sans">
            Customize destination labels, travel companions, and overall budget targets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-meta">
          <div className="space-y-1.5">
            <label className="font-bold text-[#3B2316] block">Trip Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#3B2316] block">Destination City</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#3B2316] block">Base Hotel</label>
              <input
                type="text"
                value={formData.hotel}
                onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                placeholder="e.g. Colaba Heritage Quarter"
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#3B2316] block">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#3B2316] block">End Date</label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-[#3B2316] block">Number of Travelers</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.travelers}
                onChange={(e) =>
                  setFormData({ ...formData, travelers: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#3B2316] block">Total Budget Target (₹)</label>
              <input
                type="number"
                step={500}
                value={formData.totalBudgetLimit}
                onChange={(e) =>
                  setFormData({ ...formData, totalBudgetLimit: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2.5 bg-[#FFFDF9] border border-[#E6DAC6] rounded-xl text-[#3B2316] font-sans focus:outline-none focus:border-[#B84A27]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DAC6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-heading font-semibold text-[#7A5C49] hover:text-[#3B2316] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#B84A27] to-[#D47A39] text-[#FFFDF9] rounded-xl font-heading text-xs font-bold shadow-md shadow-[#B84A27]/20 hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#FFFDF9]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
