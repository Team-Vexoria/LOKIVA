import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Mail,
  QrCode,
  Printer,
  X,
  Sparkles,
} from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://lokiva.in/itinerary';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSent(true);
    setTimeout(() => {
      setEmailSent(false);
      setEmail('');
    }, 4000);
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
          <span className="text-xs font-mono font-bold text-marigold uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Collaborate & Share</span>
          </span>
          <h3 className="text-2xl font-display font-bold text-ink">
            Share Your Travel Journey
          </h3>
          <p className="text-xs text-dusk-600 font-sans">
            Invite travel companions to review times, costs, and cultural landmarks.
          </p>
        </div>

        {/* Copy Share Link */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-ink block">
            Direct Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 bg-paper-100 border border-paper-300 rounded-xl text-xs font-mono text-ink select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 bg-ink text-paper hover:bg-ink-800 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-marigold" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Email Travel Companion Form */}
        <form onSubmit={handleSendEmail} className="space-y-2 pt-2 border-t border-paper-200">
          <label className="text-xs font-mono font-bold text-ink block">
            Send via Email
          </label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="companion@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-ink transition"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal hover:bg-teal-700 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>{emailSent ? 'Sent!' : 'Send'}</span>
            </button>
          </div>
          {emailSent && (
            <span className="text-[11px] font-mono text-teal block">
              ✓ Itinerary overview sent to companion.
            </span>
          )}
        </form>

        {/* Print / PDF Option */}
        <div className="pt-2 border-t border-paper-200 flex items-center justify-between">
          <div className="text-xs font-mono text-dusk">
            Need an offline paper copy?
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="px-4 py-2 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl text-xs font-mono font-bold border border-paper-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-marigold" />
            <span>Print Itinerary PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
