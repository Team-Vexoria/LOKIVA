import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItineraryStore } from '../store/useItineraryStore';
import { TripHeaderOverview } from '../components/itinerary/TripHeaderOverview';
import { ItineraryViewTabs } from '../components/itinerary/ItineraryViewTabs';
import { DayCardTimeline } from '../components/itinerary/DayCardTimeline';
import { FeasibilityPanel } from '../components/itinerary/FeasibilityPanel';
import { TripSummarySidebar } from '../components/itinerary/TripSummarySidebar';
import { ItineraryMapView } from '../components/itinerary/ItineraryMapView';
import { ItineraryListView } from '../components/itinerary/ItineraryListView';
import { ItineraryBudgetView } from '../components/itinerary/ItineraryBudgetView';
import { ShareItineraryModal } from '../components/itinerary/ShareItineraryModal';
import { EditTripModal } from '../components/itinerary/EditTripModal';
import { AddActivityModal } from '../components/itinerary/AddActivityModal';
import { INDIAN_STATES_AND_CITIES, POPULAR_CITIES_LIST } from '../data/places';
import {
  Plus,
  Sparkles,
  Compass,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';

export function ItineraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Zustand Itinerary Store
  const {
    tripDetails,
    days,
    selectedDay,
    activeStopId,
    hoveredStopId,
    viewMode,
    feasibilityMetrics,
    practicalInfo,
    isGenerating,
    lastReplanMessage,
    setSelectedDay,
    setActiveStopId,
    setHoveredStopId,
    setViewMode,
    reorderActivity,
    deleteActivity,
    addActivity,
    updateActivity,
    setDayStartTime,
    replanDay,
    generateTrip,
    clearReplanMessage,
  } = useItineraryStore();

  // Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [addAfterIndex, setAddAfterIndex] = useState<number | undefined>(undefined);

  // Generator control bar states
  const [inputCity, setInputCity] = useState(tripDetails.destination || 'Jaipur');
  const [inputState, setInputState] = useState(tripDetails.state || 'Rajasthan');
  const [inputDays, setInputDays] = useState(days.length || 3);
  const [inputPace, setInputPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Auto-generate if URL query parameters change (e.g. /itinerary?city=Varanasi&days=3)
  useEffect(() => {
    const cityParam = searchParams.get('city');
    const stateParam = searchParams.get('state');
    const daysParam = searchParams.get('days') ? parseInt(searchParams.get('days')!, 10) : null;
    const paceParam = (searchParams.get('pace') as 'relaxed' | 'balanced' | 'packed') || null;

    if (cityParam && cityParam.toLowerCase() !== tripDetails.destination.toLowerCase()) {
      setInputCity(cityParam);
      if (stateParam) setInputState(stateParam);
      if (daysParam) setInputDays(daysParam);
      if (paceParam) setInputPace(paceParam);

      generateTrip({
        city: cityParam,
        state: stateParam || undefined,
        daysCount: daysParam || 3,
        pace: paceParam || 'balanced',
        travelers: tripDetails.travelers || 2,
        budgetLimit: tripDetails.totalBudgetLimit || 25000,
      });
    }
  }, [searchParams]);

  // Active day and its feasibility metrics
  const activeDayIndex = Math.max(0, Math.min(days.length - 1, selectedDay - 1));
  const activeDay = days[activeDayIndex] || days[0];
  const activeMetrics = activeDay ? feasibilityMetrics[activeDay.dayNumber] || null : null;

  // Preceding stop for proximity search in Add Activity Modal
  const precedingStop =
    addAfterIndex !== undefined && activeDay?.activities[addAfterIndex]
      ? activeDay.activities[addAfterIndex]
      : activeDay?.activities[activeDay.activities.length - 1] || null;

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateTrip({
      city: inputCity,
      state: inputState || undefined,
      daysCount: inputDays,
      pace: inputPace,
      travelers: tripDetails.travelers || 2,
      budgetLimit: tripDetails.totalBudgetLimit || 25000,
    });
    setSearchParams({ city: inputCity, days: String(inputDays), pace: inputPace });
  };

  const handleQuickCitySelect = (cityName: string) => {
    setInputCity(cityName);
    const stateObj = INDIAN_STATES_AND_CITIES.find((s) => s.cities.includes(cityName));
    const st = stateObj ? stateObj.state : '';
    if (st) setInputState(st);

    generateTrip({
      city: cityName,
      state: st || undefined,
      daysCount: inputDays,
      pace: inputPace,
      travelers: tripDetails.travelers || 2,
      budgetLimit: tripDetails.totalBudgetLimit || 25000,
    });
    setSearchParams({ city: cityName, days: String(inputDays), pace: inputPace });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAddModal = (dayNum: number, afterIdx?: number) => {
    setSelectedDay(dayNum);
    setAddAfterIndex(afterIdx);
    setIsAddActivityModalOpen(true);
  };

  // Compute Grand Total for Header
  const allActivities = days.flatMap((d) => d.activities);
  const totalExperiencesCost = allActivities.reduce(
    (sum, act) => sum + (act.costPerPerson || 0) * (tripDetails.travelers || 2),
    0
  );
  const totalTransitCost = allActivities.reduce((sum, act) => sum + (act.transitCost || 0), 0);
  const totalMealsCost = days.length * 800 * (tripDetails.travelers || 2);
  const grandTotal = totalExperiencesCost + totalTransitCost + totalMealsCost;

  return (
    <div className="min-h-screen bg-paper text-ink pb-20 pt-4 sm:pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* 1. Dynamic Trip Generator Bar */}
        <section className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-4 sm:p-5 shadow-xs space-y-3">
          <form onSubmit={handleGenerateSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Destination City */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-mono uppercase font-bold text-dusk block">
                Destination City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#C1443B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={inputCity}
                  onChange={(e) => setInputCity(e.target.value)}
                  placeholder="Jaipur, Varanasi, Kochi, Mumbai..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs sm:text-sm text-ink font-sans focus:outline-none focus:border-ink shadow-2xs"
                />
              </div>
            </div>

            {/* Days Count (1 to 7 Days) */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-mono uppercase font-bold text-dusk block">
                Duration: {inputDays} {inputDays === 1 ? 'Day' : 'Days'}
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInputDays(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      inputDays === num
                        ? 'bg-ink text-white shadow-2xs'
                        : 'bg-white text-ink border border-[#E5DFD5] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {num}D
                  </button>
                ))}
              </div>
            </div>

            {/* Pace Selector */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-mono uppercase font-bold text-dusk block">
                Travel Pace
              </label>
              <div className="flex items-center gap-1">
                {(['relaxed', 'balanced', 'packed'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setInputPace(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold capitalize transition cursor-pointer ${
                      inputPace === p
                        ? 'bg-ink text-white shadow-2xs'
                        : 'bg-white text-ink border border-[#E5DFD5] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 bg-[#C1443B] hover:bg-[#a8362e] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Solving...' : 'Re-Generate'}</span>
              </button>
            </div>
          </form>

          {/* Quick 24 Iconic Cities Bar */}
          <div className="pt-2 border-t border-[#E5DFD5] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase font-bold text-[#C1443B] shrink-0">
              Quick Hubs:
            </span>
            {POPULAR_CITIES_LIST.map((c) => {
              const isSelected = inputCity.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleQuickCitySelect(c)}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-sans whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-white font-bold'
                      : 'bg-white text-ink border border-[#E5DFD5] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Replan Alert Toast Banner */}
        {lastReplanMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-sans text-emerald-900 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{lastReplanMessage}</span>
            </div>
            <button
              onClick={clearReplanMessage}
              className="p-1 text-emerald-700 hover:text-emerald-950 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Trip Header Overview Card */}
        <TripHeaderOverview
          tripDetails={tripDetails}
          totalCost={grandTotal}
          onEditTrip={() => setIsEditTripModalOpen(true)}
          onShare={() => setIsShareModalOpen(true)}
          onPrint={handlePrint}
        />

        {/* 4. Day Tabs & View Mode Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Day Selector Pills */}
          <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Days">
            {days.map((day) => {
              const isSelected = selectedDay === day.dayNumber;
              const metric = feasibilityMetrics[day.dayNumber];
              const score = metric ? metric.paceScore : 90;

              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDay(day.dayNumber)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-white shadow-sm'
                      : 'bg-[#FAF7F2] text-ink hover:bg-white border border-[#E5DFD5]'
                  }`}
                >
                  <span>Day {day.dayNumber}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {score}%
                  </span>
                </button>
              );
            })}
          </nav>

          {/* View Modes Tabs */}
          <ItineraryViewTabs currentView={viewMode} onViewChange={setViewMode} />
        </div>

        {/* 5. Main Content Area */}
        {viewMode === 'map' ? (
          <ItineraryMapView
            days={days}
            selectedDayNumber={selectedDay}
            activeStopId={activeStopId}
            hoveredStopId={hoveredStopId}
            onSelectStop={(id) => setActiveStopId(id)}
          />
        ) : viewMode === 'list' ? (
          <ItineraryListView days={days} />
        ) : viewMode === 'budget' ? (
          <ItineraryBudgetView
            days={days}
            tripDetails={tripDetails}
            practicalInfo={practicalInfo}
          />
        ) : (
          /* Default Timeline View (Two-Column Desktop Layout) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column (8 cols): Feasibility Panel & Day Timeline */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              {/* Feasibility & Replan Barometer */}
              {activeDay && (
                <FeasibilityPanel
                  metrics={activeMetrics}
                  dayNumber={activeDay.dayNumber}
                  activeFilter={activeDay.activeFilter || 'none'}
                  onReplan={(condition) => replanDay(activeDay.dayNumber, condition)}
                />
              )}

              {/* Active Day Sequential Timeline */}
              {activeDay && (
                <DayCardTimeline
                  day={activeDay}
                  totalDays={days.length}
                  activeStopId={activeStopId}
                  hoveredStopId={hoveredStopId}
                  onUpdateActivityStatus={(dayNum, actId, status) =>
                    updateActivity(dayNum, actId, { bookingStatus: status })
                  }
                  onUpdateActivityNotes={(dayNum, actId, notes) =>
                    updateActivity(dayNum, actId, { notes })
                  }
                  onUpdateActivityDuration={(dayNum, actId, durationMins) =>
                    updateActivity(dayNum, actId, {
                      visitDurationMinutes: durationMins,
                      durationMins,
                      duration: `${durationMins} mins`,
                    })
                  }
                  onMoveActivity={(dayNum, fromIdx, toIdx) =>
                    reorderActivity(dayNum, fromIdx, toIdx)
                  }
                  onRemoveActivity={(dayNum, actId) => deleteActivity(dayNum, actId)}
                  onAddActivityClick={(dayNum, afterIdx) => handleOpenAddModal(dayNum, afterIdx)}
                  onSetStartTime={(dayNum, startTime) => setDayStartTime(dayNum, startTime)}
                  onStopHover={(id) => setHoveredStopId(id)}
                  onStopSelect={(id) => setActiveStopId(id)}
                />
              )}
            </div>

            {/* Right Column (4 cols): Sticky Map & Cost/Impact Sidebar */}
            <div className="lg:col-span-4 space-y-6 sticky top-20">
              {/* Embedded Live Route Map */}
              <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
                    Day {selectedDay} Route Map
                  </span>
                  <button
                    onClick={() => setViewMode('map')}
                    className="text-[11px] font-mono text-[#C1443B] hover:underline cursor-pointer"
                  >
                    Full Screen Map &rarr;
                  </button>
                </div>

                <ItineraryMapView
                  days={days}
                  selectedDayNumber={selectedDay}
                  activeStopId={activeStopId}
                  hoveredStopId={hoveredStopId}
                  onSelectStop={(id) => setActiveStopId(id)}
                />
              </div>

              {/* Trip Financial & Local Impact Sidebar */}
              <TripSummarySidebar
                tripDetails={tripDetails}
                days={days}
                practicalInfo={practicalInfo}
                onShare={() => setIsShareModalOpen(true)}
                onPrint={handlePrint}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <AddActivityModal
        isOpen={isAddActivityModalOpen}
        onClose={() => setIsAddActivityModalOpen(false)}
        dayNumber={selectedDay}
        insertAfterIndex={addAfterIndex}
        precedingStop={precedingStop}
        dayCity={tripDetails.destination}
        onAddActivity={(dayNum, newAct, afterIdx) => addActivity(dayNum, newAct, afterIdx)}
      />

      <ShareItineraryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tripDetails={tripDetails}
        days={days}
        onPrint={handlePrint}
      />

      <EditTripModal
        isOpen={isEditTripModalOpen}
        onClose={() => setIsEditTripModalOpen(false)}
        tripDetails={tripDetails}
        onSave={(updated) => {
          useItineraryStore.setState({ tripDetails: updated });
        }}
      />
    </div>
  );
}
