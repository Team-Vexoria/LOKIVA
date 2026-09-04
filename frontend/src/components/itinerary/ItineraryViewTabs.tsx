import React from 'react';
import { Clock, Map, ListFilter, PieChart } from 'lucide-react';
import { ItineraryViewMode } from '../../types/itinerary';

interface ItineraryViewTabsProps {
  currentView: ItineraryViewMode;
  onViewChange: (view: ItineraryViewMode) => void;
}

export function ItineraryViewTabs({ currentView, onViewChange }: ItineraryViewTabsProps) {
  const tabs: { id: ItineraryViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'timeline', label: 'Timeline View', icon: Clock },
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'list', label: 'List View', icon: ListFilter },
    { id: 'budget', label: 'Budget View', icon: PieChart },
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Itinerary View Modes">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onViewChange(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all duration-150 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk-700 border border-paper-300'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-marigold' : 'text-dusk'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
