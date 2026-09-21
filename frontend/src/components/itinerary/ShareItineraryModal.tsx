import React, { useState } from 'react';
import { X, Check, Copy, Share2, Printer, Mail, MessageCircle, Calendar, MapPin, Sparkles } from 'lucide-react';
import { ItineraryTripDetails, ItineraryDay } from '../../types/itinerary';

interface ShareItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  onPrint: () => void;
}

export function ShareItineraryModal({
  isOpen,
  onClose,
  tripDetails,
  days,
  onPrint,
}: ShareItineraryModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/itinerary?city=${encodeURIComponent(tripDetails.destination)}&days=${days.length}`
      : 'https://lokiva.vercel.app/itinerary';

  // Format rich WhatsApp card
  const formatWhatsAppText = () => {
    let lines = [
      `🇮🇳 *${tripDetails.title}*`,
      `📍 *Destination:* ${tripDetails.destination}, ${tripDetails.state}`,
      `👥 *Travelers:* ${tripDetails.travelers} | ⏳ *Duration:* ${days.length} Days`,
      '',
    ];

    days.forEach((d) => {
      lines.push(`🗓️ *DAY ${d.dayNumber}: ${d.title}* (${d.date}, ${d.dayOfWeek})`);
      d.activities.forEach((act, idx) => {
        const transitInfo =
          act.transitDistanceKm > 0
            ? ` [${act.transitMode === 'walking' ? 'Walk' : 'Auto'} ${act.transitToNextMinutes}m]`
            : '';
        lines.push(`  ${idx + 1}. ${act.startTime} : *${act.title}* (${act.location})${transitInfo}`);
      });
      lines.push('');
    });

    lines.push(`✨ *Shared via LOKIVA:* ${currentUrl}`);
    return lines.join('\n');
  };

  const whatsappMessage = formatWhatsAppText();

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(whatsappMessage);
      }
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] max-w-lg w-full p-5 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-dusk hover:text-ink rounded-full hover:bg-white border border-transparent hover:border-[#E5DFD5] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 shrink-0">
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B] flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span>Collaborate & Export</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
            Share Itinerary
          </h3>
          <p className="text-xs text-dusk font-sans">
            Export a clean WhatsApp-ready message or share the interactive live itinerary link.
          </p>
        </div>

        {/* WhatsApp Card Preview */}
        <div className="flex-1 overflow-y-auto bg-white p-4 rounded-xl border border-[#E5DFD5] font-mono text-xs text-ink space-y-2 select-all shadow-inner">
          <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink">
            {whatsappMessage}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 shrink-0 pt-2 border-t border-[#E5DFD5]">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102 active:scale-98"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Open & Send via WhatsApp</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] text-ink font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied Text!' : 'Copy WhatsApp Text'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] text-ink font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Web Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
