import React, { useState } from 'react';
import { X, Check, Copy, Share2, Printer, Mail, MessageCircle, Calendar, MapPin } from 'lucide-react';
import { ItineraryTripDetails } from '../../types/itinerary';

interface ShareItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDetails: ItineraryTripDetails;
  onPrint: () => void;
}

export function ShareItineraryModal({
  isOpen,
  onClose,
  tripDetails,
  onPrint,
}: ShareItineraryModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://lokiva.vercel.app/itinerary';
  const shareText = `Check out our curated itinerary for ${tripDetails.title} (${tripDetails.destination}, ${tripDetails.state}) on LOKIVA!`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Travel Itinerary: ${tripDetails.title}`);
    const body = encodeURIComponent(`${shareText}\n\nLink: ${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
            <Share2 className="w-3.5 h-3.5" />
            <span>Collaborate & Share</span>
          </span>
          <h3 className="text-2xl font-display font-bold text-ink">
            Share Itinerary
          </h3>
          <p className="text-xs text-dusk-600 font-sans">
            Share this personalized travel plan with your co-travelers, family, or friends.
          </p>
        </div>

        {/* Trip Overview Snippet */}
        <div className="p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-2">
          <p className="font-display font-bold text-ink text-sm leading-snug">
            {tripDetails.title}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-dusk font-mono">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal" />
              {tripDetails.destination}, {tripDetails.state}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-marigold" />
              {tripDetails.startDate} – {tripDetails.endDate}
            </span>
          </div>
        </div>

        {/* Direct Link Copy */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-ink block font-mono">
            Direct Share Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-ink font-mono text-xs focus:outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                copied
                  ? 'bg-teal text-white'
                  : 'bg-ink text-white hover:bg-ink-700 active:scale-98'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Channels */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-paper-300 bg-white hover:bg-paper-50 hover:border-teal/50 transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono font-bold text-ink">WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleEmail}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-paper-300 bg-white hover:bg-paper-50 hover:border-teal/50 transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono font-bold text-ink">Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-paper-300 bg-white hover:bg-paper-50 hover:border-teal/50 transition cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-amber-50 text-marigold flex items-center justify-center group-hover:scale-105 transition">
              <Printer className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono font-bold text-ink">Print / PDF</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-paper-300 font-mono text-xs font-bold text-ink hover:bg-paper-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
