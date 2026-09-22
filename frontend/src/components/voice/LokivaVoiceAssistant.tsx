import React, { useState, useEffect, useRef } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { VoiceResponse } from './VoiceResponse';
import { ExpenseChatDrawer } from './ExpenseChatDrawer';
import {
  ExpenseConversationManager,
  ExpenseMessage,
  ConversationState,
} from '../../lib/expenseConversation';
import { routeVoiceInput, VoiceRouteResponse } from '../../lib/voiceRouter';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  CloudSun,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  HelpCircle,
  Volume2,
} from 'lucide-react';

export interface LokivaVoiceAssistantProps {
  currentLocationName?: string;
  currentItinerary?: any;
  activeTripDeadlines?: Array<{ label: string; time: string }>;
}

export const LokivaVoiceAssistant: React.FC<LokivaVoiceAssistantProps> = ({
  currentLocationName = 'City Palace, Jaipur',
  currentItinerary,
  activeTripDeadlines = [{ label: '4 PM Express Train', time: '16:00' }],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lastResponse, setLastResponse] = useState<VoiceRouteResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('IDLE');
  const [expenseMessages, setExpenseMessages] = useState<ExpenseMessage[]>([]);
  const [todayTotal, setTodayTotal] = useState<number>(0);

  const conversationManagerRef = useRef<ExpenseConversationManager | null>(null);

  // Initialize Voice Input hook
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error: voiceError,
    isSupported,
  } = useVoiceInput({
    onFinalTranscript: (finalText) => {
      handleProcessSpeech(finalText);
    },
  });

  // Initialize Conversation Manager for multi-turn expenses
  useEffect(() => {
    const manager = new ExpenseConversationManager(
      {
        onStateChange: (state) => {
          setConversationState(state);
        },
        onMessagesChange: (messages) => {
          setExpenseMessages(messages);
        },
        onTotalChange: (total) => {
          setTodayTotal(total);
        },
        onAssistantSpeak: (text) => {
          setLastResponse({
            intent: 'log_expense',
            spoken_response: text,
            data: { today_total_inr: manager.getTodayTotal() },
          });
        },
        onRequestListen: () => {
          startListening();
        },
        onStopListen: () => {
          stopListening();
        },
      },
      {
        currentLocationName,
        currentItinerary,
        activeTripDeadlines,
      }
    );

    conversationManagerRef.current = manager;

    return () => {
      manager.cleanup();
    };
  }, [currentLocationName, currentItinerary, activeTripDeadlines, startListening, stopListening]);

  // Process finalized text
  const handleProcessSpeech = async (speechText: string) => {
    if (!speechText || speechText.trim() === '') return;
    setIsProcessing(true);

    try {
      if (conversationManagerRef.current) {
        conversationManagerRef.current.updateContext({
          currentLocationName,
          currentItinerary,
          activeTripDeadlines,
        });
      }

      // Check if this belongs to an active expense conversation session
      const lower = speechText.toLowerCase();
      const isExpenseRelated =
        conversationState === 'ACTIVE_SESSION' ||
        lower.includes('spent') ||
        lower.includes('spend') ||
        lower.includes('expense') ||
        lower.includes('rupees') ||
        lower.includes('₹') ||
        lower.includes('cost');

      if (isExpenseRelated && conversationManagerRef.current) {
        await conversationManagerRef.current.handleTranscript(speechText);
      } else {
        // Standard single intent route through Gemini backend proxy
        const result = await routeVoiceInput(speechText, {
          currentLocationName,
          currentItinerary,
          activeTripDeadlines,
        });
        setLastResponse(result);
      }
    } catch (err) {
      console.warn('[VoiceAssistant] Error handling speech:', err);
      setLastResponse({
        intent: 'none',
        spoken_response:
          'I could not reach the server right now. Please try again or tap one of the suggested prompts.',
      });
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setLastResponse(null);
      startListening();
    }
  };

  const handlePromptClick = (promptText: string) => {
    handleProcessSpeech(promptText);
  };

  const handleClose = () => {
    stopListening();
    if (conversationManagerRef.current) {
      conversationManagerRef.current.endSession();
    }
    setIsOpen(false);
  };

  const displayedTranscript = interimTranscript || transcript;

  return (
    <>
      {/* Floating Action Microphone Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Open LOKIVA Voice Assistant"
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#12213B] text-white shadow-xl hover:bg-[#C1443B] transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/20"
        >
          <Mic className="w-6 h-6 text-[#FFC067] group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C1443B] opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#C1443B]" />
          </span>
        </button>
      </div>

      {/* Voice Assistant Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DFD5] bg-white/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C1443B] text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#FFC067]" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-extrabold text-ink tracking-tight">
                    LOKIVA Voice Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-dusk-600">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isListening
                          ? 'bg-rose-500 animate-pulse'
                          : isProcessing
                          ? 'bg-amber-500 animate-pulse'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span>
                      {isListening
                        ? 'Listening...'
                        : isProcessing
                        ? 'Thinking with Gemini...'
                        : conversationState === 'ACTIVE_SESSION'
                        ? 'Expense Session Active'
                        : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-black/5 text-ink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {!isSupported && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Speech recognition is not natively supported in this browser. Please use Chrome, Edge, or Safari, or click the quick prompt chips below.
                  </span>
                </div>
              )}

              {/* Live Audio / Waveform Visualizer & Big Push-to-Talk Mic */}
              <div className="flex flex-col items-center justify-center py-4 bg-white/80 rounded-2xl border border-[#E5DFD5] p-5">
                <div className="relative mb-3">
                  {isListening && (
                    <div className="absolute -inset-3 rounded-full bg-[#C1443B]/20 animate-ping" />
                  )}
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                      isListening
                        ? 'bg-[#C1443B] text-white scale-105'
                        : 'bg-ink text-white hover:bg-[#C1443B]'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-8 h-8 text-white animate-bounce" />
                    ) : (
                      <Mic className="w-8 h-8 text-[#FFC067]" />
                    )}
                  </button>
                </div>

                <span className="text-xs font-heading font-bold text-ink mb-1">
                  {isListening ? 'Tap to Stop & Send' : 'Tap to Speak'}
                </span>
                <span className="text-[11px] font-mono text-dusk-600">
                  {isListening ? 'Speak your query naturally' : 'Push-to-talk voice interface'}
                </span>

                {/* Real-time transcript preview */}
                {displayedTranscript && (
                  <div className="mt-3 w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-center">
                    <p className="text-xs font-sans text-ink italic">
                      "{displayedTranscript}"
                    </p>
                  </div>
                )}
              </div>

              {/* Spoken Response Playback Widget */}
              {lastResponse && (
                <VoiceResponse
                  text={lastResponse.spoken_response}
                  categoryTag={lastResponse.intent.toUpperCase().replace('_', ' ')}
                  onFinishedSpeaking={() => {
                    if (conversationManagerRef.current) {
                      conversationManagerRef.current.onAssistantFinishedSpeaking();
                    }
                  }}
                />
              )}

              {/* Weather Telemetry Details (Module C) */}
              {lastResponse?.intent === 'get_weather' && lastResponse.data && (
                <div className="bg-white border border-[#E5DFD5] rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudSun className="w-5 h-5 text-[#C1443B]" />
                      <span className="text-xs font-heading font-bold text-ink">
                        {lastResponse.data.location_name || currentLocationName}
                      </span>
                    </div>

                    {/* Explicit is_live / Estimated badge */}
                    {lastResponse.data.is_live ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Live OpenWeather
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Estimated Forecast
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl font-mono font-black text-ink">
                      {lastResponse.data.temp_c}°C
                    </span>
                    <span className="text-xs font-sans capitalize text-dusk-600">
                      {lastResponse.data.condition} (Feels like {lastResponse.data.feels_like_c}°C)
                    </span>
                  </div>

                  {lastResponse.data.will_rain_soon && (
                    <div className="flex items-center gap-1.5 text-[11px] font-sans text-[#C1443B] font-medium pt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Rain expected soon: indoor cultural venues recommended.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Spatiotemporal Query Recommendation Card (Module B) */}
              {lastResponse?.intent === 'find_nearby_experience' && lastResponse.data && (
                <div className="bg-white border border-[#E5DFD5] rounded-2xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#C1443B]">
                      Spatiotemporal Match
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-dusk-600 border border-[#E5DFD5]">
                      {lastResponse.data.crowd_tag === 'low' ? 'usually quiet' : 'moderate crowd'}
                    </span>
                  </div>

                  <h4 className="text-sm font-display font-bold text-ink">
                    {lastResponse.data.name}
                  </h4>

                  <div className="flex items-center gap-3 text-xs font-mono text-dusk-600 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
                      {lastResponse.data.distance_meters}m walk
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      +{lastResponse.data.time_remaining_after_visit_minutes}m spare
                    </span>
                    <span>•</span>
                    <span className="font-bold text-ink">
                      {lastResponse.data.price_inr > 0 ? `₹${lastResponse.data.price_inr}` : 'Free'}
                    </span>
                  </div>
                </div>
              )}

              {/* Multi-turn Expense Drawer Log (Module D) */}
              <ExpenseChatDrawer
                messages={expenseMessages}
                state={conversationState}
                todayTotal={todayTotal}
              />

              {/* Quick Prompt Chips */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-dusk-600 block mb-2">
                  Try Asking
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePromptClick('What can we see near City Palace in 90 minutes before our 4 PM train and 500 rupees left?')
                    }
                    className="text-left text-xs font-sans px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF0E6] text-ink border border-[#E5DFD5] transition shadow-2xs"
                  >
                    🏛️ "Near City Palace with 90 mins & ₹500 left?"
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptClick('How is the weather in Jaipur right now?')}
                    className="text-left text-xs font-sans px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF0E6] text-ink border border-[#E5DFD5] transition shadow-2xs"
                  >
                    ⛅ "How is the weather in Jaipur right now?"
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptClick('How much did I spend today?')}
                    className="text-left text-xs font-sans px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF0E6] text-ink border border-[#E5DFD5] transition shadow-2xs"
                  >
                    💰 "How much did I spend today?"
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePromptClick('I spent 200 rupees on chai and snacks')}
                    className="text-left text-xs font-sans px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF0E6] text-ink border border-[#E5DFD5] transition shadow-2xs"
                  >
                    ☕ "I spent 200 rupees on chai and snacks"
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
