import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Heart,
  Sparkles,
  Share2,
  X,
  Check,
  Send,
  BookOpen,
} from 'lucide-react';

export interface TravelBlogStory {
  id: string;
  destination: string;
  city: string;
  state: string;
  title: string;
  shortDescription: string;
  fullStory: string[];
  tips: string[];
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  category: string;
  image: string;
  likes: number;
}

export function TravelBlogsSection() {
  const navigate = useNavigate();

  // Curated, authentic community travel blog stories
  const blogStories: TravelBlogStory[] = [
    {
      id: 'story-1',
      destination: 'Leh & Nubra Valley, Ladakh',
      city: 'Leh',
      state: 'Ladakh',
      title: 'The Silent Passes: Crossing Khardung La on Royal Enfield & Stargazing in Hunder',
      shortDescription:
        'From prayer flags fluttering in minus-four morning winds to finding double-humped Bactrian camels among silver sand dunes, here is my 7-day high-altitude diary.',
      fullStory: [
        'The ascent up Khardung La at 5:30 AM begins before the sun crests the jagged Karakoram range. The crisp Himalayan air carries the faint scent of juniper smoke and burning butter lamps from the monastery below.',
        'Descending into the Nubra Valley, the stark moonscape gives way to the luminous white dunes of Hunder. By midnight, with zero ambient light pollution, the Milky Way arches across the sky with photographic clarity rarely witnessed anywhere else on earth.',
        'Staying with a local Ladakhi family in Diskit, we were treated to hot butter tea (Gur Gur chai) and freshly steamed tingmo buns served straight from their wood-fired kitchen hearth.',
      ],
      tips: [
        'Spend 48 hours strictly acclimatizing in Leh town before crossing any high passes.',
        'Rent thermal riding gloves and oxygen canisters from the Leh main bazaar.',
        'Book homestays in Hunder instead of tent camps for authentic local warmth and Ladakhi cuisine.',
      ],
      author: {
        name: 'Vikramaditya Rathore',
        handle: '@vikram_trails',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      },
      date: 'Sep 18, 2026',
      readTime: '6 min read',
      category: 'High Altitude & Trails',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
      likes: 412,
    },
    {
      id: 'story-2',
      destination: 'Kumarakom & Alleppey, Kerala',
      city: 'Alleppey',
      state: 'Kerala',
      title: 'Meen Pollichathu & Slow Canoes: A Culinary Monsoon Journey Along Vembanad Lake',
      shortDescription:
        'Why traveling through the backwaters during the southwest monsoon unlocks ancient spice plantations, clay-pot pearl spot fish, and village toddy shacks.',
      fullStory: [
        'While winter is the standard recommendation for Kerala, the monsoon breathes a deep emerald enchantment into the backwaters. Raindrops ripple across the calm waterways like liquid glass while coconut palms sway in slow cadence.',
        'We boarded a narrow wooden country canoe instead of a commercial houseboat. This allowed us to navigate narrow side-canals where village women wash handloom sarees and fishermen cast Chinese gill nets.',
        'Lunch at a village toddy shop introduced us to Karimeen Pollichathu: pearl spot fish coated in freshly crushed shallots, fiery bird’s eye chilies, and curry leaves, wrapped in a wilted banana leaf and charred over coconut husk embers.',
      ],
      tips: [
        'Choose open country canoes over large motorized houseboats to reach village canal networks.',
        'Visit Kumarakom Bird Sanctuary at 6:00 AM to spot migratory darters and white ibises.',
        'Carry a breathable rain poncho and waterproof dry bags for your electronics.',
      ],
      author: {
        name: 'Ananya Deshmukh',
        handle: '@ananya_eats',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      date: 'Sep 12, 2026',
      readTime: '5 min read',
      category: 'Culinary Traditions',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      likes: 589,
    },
    {
      id: 'story-3',
      destination: 'Bagru & Jodhpur, Rajasthan',
      city: 'Jaipur',
      state: 'Rajasthan',
      title: 'The Indigo Vats of Bagru: Three Days Inside a 300-Year-Old Chhipa Blockprinting Family',
      shortDescription:
        'Carving seasoned teak blocks, mixing fermented indigo roots, and sun-curing geometric mud-resist fabrics along the dusty riverbeds of Marwar.',
      fullStory: [
        'Just 30 kilometers south of Jaipur lies Bagru, an artisanal enclave where the rhythmic thud-thud-thud of teak printing blocks has resonated without pause for three centuries.',
        'I stayed in the courtyard of master artisan Ramswaroop Chhipa. The morning began with preparing the Dabu paste: a clay-based mud resist crafted from local black soil, lime, and gum arabic.',
        'Watching raw cotton dipped into earthen vats of fermented indigo—emerging first yellow-green before oxidizing into a vibrant, indelible royal blue—felt like witnessing ancestral alchemy.',
      ],
      tips: [
        'Wear clothes you do not mind staining with natural indigo dyes.',
        'Visit between 9:00 AM and 1:00 PM when fabric drying fields are at their most vibrant.',
        'Buy directly from artisan guild homes to support local families without middlemen markups.',
      ],
      author: {
        name: 'Clara Meyer',
        handle: '@clara_travels',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      },
      date: 'Aug 29, 2026',
      readTime: '7 min read',
      category: 'Artisan Heritage',
      image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
      likes: 634,
    },
    {
      id: 'story-4',
      destination: 'Assi to Manikarnika, Varanasi',
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      title: 'Subah-e-Banaras: Rowing the Ganges at 5 AM and the Secret Malaiyo of Thatheri Bazaar',
      shortDescription:
        'Navigating medieval stone labyrinths where winter saffron milk foam melts on your tongue and dawn flute ragas echo over sacred bathing ghats.',
      fullStory: [
        'There is a quiet hour in Varanasi before the temple bells clang into chorus. At 5:00 AM, the wooden oars of our boatman cut silently through misty river currents while priests at Assi Ghat chant classical Vedic hymns.',
        'Walking up into the serpentine alleys of Thatheri Bazaar, brass smiths were already shaping water pots with rhythmic hammer taps. Tucked in a corner stood an 80-year-old sweet shop serving Malaiyo.',
        'Fluffy, cloud-like foam skimmed from raw milk left overnight under winter dew, infused with pure Kashmiri saffron, cardamom, and topped with crushed pistachios. It dissolves on your tongue into pure serenity.',
      ],
      tips: [
        'Hire an unmotorized wooden rowboat rather than a noisy diesel ferry for dawn meditation.',
        'Sample Malaiyo early in the morning before noon when the sun dissolves the delicate foam.',
        'Explore the inner galis (lanes) with a certified local historian to uncover centuries of oral folklore.',
      ],
      author: {
        name: 'Devendra Shastri',
        handle: '@dev_shastri',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
      date: 'Aug 15, 2026',
      readTime: '4 min read',
      category: 'Spiritual & Living Lore',
      image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80',
      likes: 821,
    },
  ];

  // Component state
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [activeStory, setActiveStory] = useState<TravelBlogStory | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for community story submission
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    category: 'Cultural Discoveries',
    story: '',
    authorName: '',
    handle: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedStories((prev) => {
      const next = !prev[id];
      showToast(next ? 'Saved story to reading list! 📖' : 'Removed from reading list');
      return { ...prev, [id]: next };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.destination || !formData.story) {
      showToast('Please fill out all required story fields');
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsShareModalOpen(false);
      setFormData({
        title: '',
        destination: '',
        category: 'Cultural Discoveries',
        story: '',
        authorName: '',
        handle: '',
      });
      showToast('Your story was submitted for editorial review! 🌟');
    }, 1800);
  };

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12213B] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 text-xs sm:text-sm font-medium flex items-center gap-2 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-[#FFC067]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-[#E5DFD5] pb-6 sm:pb-8">
        <div className="space-y-2 text-left max-w-2xl">
          <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.22em] text-[#B45309] uppercase">
            COMMUNITY DISPATCHES
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight leading-tight">
            Stories From the Journey
          </h2>
          <p className="text-sm sm:text-base text-[#5B6B8C] font-sans font-medium leading-relaxed">
            Real travel chronicles, hidden trails, artisan encounters, and time-tested itineraries written by travelers who wander deeper into India.
          </p>
        </div>

        {/* Share Your Story Header CTA */}
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="self-start sm:self-end px-5 py-2.5 rounded-full bg-[#12213B] hover:bg-[#1E345B] text-white text-xs sm:text-sm font-heading font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer group flex-shrink-0"
        >
          <span>Share Your Story</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 2. BLOG CARDS GRID (Responsive: 1 col on mobile, 2 col on tablet, 4 col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
        {blogStories.map((story) => {
          const isLiked = !!likedStories[story.id];
          return (
            <article
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="group bg-white rounded-[24px] border border-[#E5DFD5] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden text-left cursor-pointer"
            >
              {/* Card Image Container */}
              <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                    {story.category}
                  </span>
                </div>

                {/* Bookmark / Like Button */}
                <button
                  type="button"
                  onClick={(e) => toggleLike(e, story.id)}
                  className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                    isLiked
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-black/40 text-white/90 hover:bg-white hover:text-rose-600'
                  }`}
                  title={isLiked ? 'Saved' : 'Save Story'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                {/* Subtle Bottom Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Destination Badge Over Image */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-white drop-shadow">
                  <MapPin className="w-3 h-3 text-[#FFC067] flex-shrink-0" />
                  <span className="truncate">{story.destination}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#12213B] group-hover:text-[#B45309] transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans leading-relaxed line-clamp-3">
                    {story.shortDescription}
                  </p>
                </div>

                {/* Author & Read Story Action */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Author Meta */}
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={story.author.avatar}
                      alt={story.author.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#DDD7CC]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-heading font-bold text-[#12213B] truncate">
                        {story.author.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#5B6B8C] flex items-center gap-1">
                        <span>{story.date}</span>
                        <span>·</span>
                        <span>{story.readTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* Read Story Link */}
                  <span className="text-xs font-heading font-bold text-[#B45309] group-hover:text-[#D97706] flex items-center gap-1 flex-shrink-0">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>


      {/* ================= MODAL 1: Full Story Reader ================= */}
      {activeStory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveStory(null)}
        >
          <div
            className="bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E0D7CB] p-6 sm:p-8 text-left space-y-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#B45309] bg-[#FFF8EE] px-2.5 py-0.5 rounded-full border border-[#FFC067]/40">
                    {activeStory.category}
                  </span>
                  <span className="text-[11px] font-mono text-[#5B6B8C]">
                    {activeStory.readTime}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-display font-black text-[#12213B] leading-tight">
                  {activeStory.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Image in Modal */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-gray-100">
              <img
                src={activeStory.image}
                alt={activeStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/65 backdrop-blur-xs text-white text-xs font-mono font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFC067]" />
                <span>{activeStory.destination}</span>
              </div>
            </div>

            {/* Author Byline */}
            <div className="flex items-center justify-between bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EAE4D9]">
              <div className="flex items-center gap-3">
                <img
                  src={activeStory.author.avatar}
                  alt={activeStory.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#DDD7CC]"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-heading font-extrabold text-[#12213B]">
                    {activeStory.author.name}
                  </h4>
                  <p className="text-[11px] font-mono text-[#5B6B8C]">
                    {activeStory.author.handle} · Published {activeStory.date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => toggleLike(e, activeStory.id)}
                className="px-3 py-1.5 rounded-full bg-white border border-[#DDD7CC] text-xs font-heading font-bold text-[#12213B] flex items-center gap-1.5 hover:border-rose-400 cursor-pointer shadow-xs transition"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    likedStories[activeStory.id] ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
                  }`}
                />
                <span>{activeStory.likes + (likedStories[activeStory.id] ? 1 : 0)}</span>
              </button>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-4 text-xs sm:text-sm text-[#334155] font-sans leading-relaxed">
              {activeStory.fullStory.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Local Tips & Recommendations Box */}
            <div className="bg-[#FFF8EE] rounded-2xl p-4 sm:p-5 border border-[#FFC067]/50 space-y-2.5 text-left">
              <div className="flex items-center gap-2 font-heading font-bold text-xs sm:text-sm text-[#B45309]">
                <Sparkles className="w-4 h-4 text-[#B45309]" />
                <span>Traveler Tips & Insider Recommendations</span>
              </div>
              <ul className="space-y-2 text-xs text-[#5B6B8C]">
                {activeStory.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#B45309] font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveStory(null);
                  navigate(`/explore?city=${activeStory.city}`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#12213B] to-[#1E345B] hover:brightness-110 text-white font-heading font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Explore {activeStory.city} Experiences</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveStory(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12213B] font-heading font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: Share Your Story Form ================= */}
      {isShareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="bg-white rounded-[28px] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E0D7CB] p-6 sm:p-7 text-left space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#B45309] font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>COMMUNITY ANTHOLOGY</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-black text-[#12213B] mt-0.5">
                  Share Your Travel Story
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-lg font-heading font-bold text-[#12213B]">
                  Story Received!
                </h4>
                <p className="text-xs text-[#5B6B8C] max-w-xs mx-auto">
                  Our editorial team will review and feature your story on the LOKIVA home journal. Thank you for enriching the community!
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-heading font-bold text-[#12213B] mb-1">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Whispers of Mandu: The Rani Roopmati Pavilion at Twilight"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7CC] focus:outline-hidden focus:ring-2 focus:ring-[#B45309] font-sans text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-heading font-bold text-[#12213B] mb-1">
                      Destination & State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mandu, Madhya Pradesh"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7CC] focus:outline-hidden focus:ring-2 focus:ring-[#B45309] font-sans text-xs bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold text-[#12213B] mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7CC] focus:outline-hidden focus:ring-2 focus:ring-[#B45309] font-sans text-xs bg-[#FAF7F2]"
                    >
                      <option>Cultural Discoveries</option>
                      <option>High Altitude & Trails</option>
                      <option>Culinary Traditions</option>
                      <option>Artisan Heritage</option>
                      <option>Spiritual & Living Lore</option>
                      <option>Hidden Village Gems</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold text-[#12213B] mb-1">
                    Your Travel Narrative & Highlights *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your journey, encounters with artisans, flavors sampled, or unexpected moments..."
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7CC] focus:outline-hidden focus:ring-2 focus:ring-[#B45309] font-sans text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-heading font-bold text-[#12213B] mb-1">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7CC] focus:outline-hidden focus:ring-2 focus:ring-[#B45309] font-sans text-xs bg-[#FAF7F2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold text-[#12213B] mb-1">
                      Instagram / Social Handle
                    </label>
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      value={formData.handle}
                      onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD7CC] focus:outline-hidden focus:ring-2 focus:ring-[#B45309] font-sans text-xs bg-[#FAF7F2]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#D97706] hover:brightness-110 text-white font-heading font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Story for Publication</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12213B] font-heading font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
