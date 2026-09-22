// Central config for AI Concierge quick-suggestion chips.
// Edit this array to add, remove, or reorder chips without touching layout code.
// Each chip has a display label and the exact query text to send when tapped.

export interface VoiceSuggestion {
  label: string;
  query: string;
  icon?: string; // optional emoji prefix shown in the chip label
}

export const VOICE_SUGGESTIONS: VoiceSuggestion[] = [
  {
    label: 'Jaipur Royal Heritage',
    icon: '🏰',
    query: 'I want to explore Jaipur for authentic royal heritage and palaces in 3 hours',
  },
  {
    label: 'Mumbai Street Food',
    icon: '🌮',
    query: 'Where can I find generational street food near Gateway of India in Mumbai?',
  },
  {
    label: 'Varanasi Sacred Ghats',
    icon: '🪔',
    query: 'Find a quiet spiritual walk along Varanasi ghats in 2 hours under 500 rupees',
  },
  {
    label: 'Weather in Mumbai',
    icon: '🌤',
    query: 'How is the weather in Mumbai right now?',
  },
  {
    label: 'Weather in Jaipur',
    icon: '☀️',
    query: 'How is the weather in Jaipur right now?',
  },
  {
    label: 'Near City Palace, 90 min, 500',
    icon: '🏛',
    query: 'What can we see near City Palace in 90 minutes with 500 rupees left?',
  },
  {
    label: 'How much did I spend today?',
    icon: '💰',
    query: 'How much did I spend today?',
  },
  {
    label: 'Log 200 for chai and snacks',
    icon: '🍵',
    query: 'I spent 200 rupees on chai and snacks',
  },
  {
    label: 'Goa Coastal & Culture',
    icon: '🌊',
    query: 'Recommend authentic cultural and culinary spots in Goa away from heavy crowds',
  },
  {
    label: 'Kochi Master Artisans',
    icon: '🎨',
    query: 'Find generational master craft workshops in Fort Kochi in 3 hours',
  },
];
