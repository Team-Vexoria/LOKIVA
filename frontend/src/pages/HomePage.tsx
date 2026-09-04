import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LokivaLandingHero } from '../components/landing/LokivaLandingHero';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { SplitWords } from '../components/ui/SplitWords';
import { FaqSection } from '../components/faq/FaqSection';
import { LokivaMomentsSection } from '../components/moments/LokivaMomentsSection';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import { api } from '../lib/api';
import { Experience } from '../types';
import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 9 Curated Landmark Experiences specifically requested for the landing page
const CURATED_LANDING_EXPERIENCES: Experience[] = [
  {
    id: 1087,
    title: 'Taj Mahal (UNESCO World Heritage Site)',
    tagline: '17th-century ivory-white marble mausoleum on the southern bank of Yamuna river',
    category: 'Heritage & History',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Tajganj, Agra',
    price: 50,
    rating: 4.95,
    review_count: 540,
    approx_duration_mins: 120,
    image_url: '/api/v1/experiences/proxy-image?url=' + encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg'),
    image_urls: ['/api/v1/experiences/proxy-image?url=' + encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg')],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: true,
    tags: ['monument', 'unesco', 'mughal', 'heritage'],
  } as Experience,
  {
    id: 3752,
    title: 'India Gate & Kartavya Path',
    tagline: 'Colossal 42m triumphal arch war memorial at the heart of the ceremonial boulevard',
    category: 'Heritage & History',
    city: 'Delhi',
    state: 'Delhi',
    area_name: 'Rajpath / Kartavya Path, Central Delhi',
    price: 0,
    rating: 4.88,
    review_count: 420,
    approx_duration_mins: 60,
    image_url: '/api/v1/experiences/proxy-image?url=' + encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg'),
    image_urls: ['/api/v1/experiences/proxy-image?url=' + encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/India_Gate_in_New_Delhi_03-2016.jpg/800px-India_Gate_in_New_Delhi_03-2016.jpg')],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: true,
    tags: ['monument', 'memorial', 'history'],
  } as Experience,
  {
    id: 1491,
    title: "Marine Drive (Queen's Necklace Promenade)",
    tagline: '3.6 km sweeping C-shaped seaside boulevard overlooking the Arabian Sea',
    category: 'Nature & Wildlife',
    city: 'Mumbai',
    state: 'Maharashtra',
    area_name: 'Marine Drive, Netaji Subhash Road',
    price: 0,
    rating: 4.92,
    review_count: 385,
    approx_duration_mins: 60,
    image_url: 'https://images.pexels.com/photos/33948766/pexels-photo-33948766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    image_urls: ['https://images.pexels.com/photos/33948766/pexels-photo-33948766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: true,
    tags: ['promenade', 'sea', 'sunset', 'mumbai'],
  } as Experience,
  {
    id: 1495,
    title: 'Shree Siddhivinayak Ganpati Temple',
    tagline: "1801 CE gold-plated sanctum dedicated to Lord Ganesha, Mumbai's patron deity",
    category: 'Spiritual & Wellness',
    city: 'Mumbai',
    state: 'Maharashtra',
    area_name: 'Prabhadevi, Dadar',
    price: 0,
    rating: 4.94,
    review_count: 490,
    approx_duration_mins: 60,
    image_url: 'https://images.pexels.com/photos/30722659/pexels-photo-30722659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    image_urls: ['https://images.pexels.com/photos/30722659/pexels-photo-30722659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: true,
    tags: ['temple', 'spiritual', 'ganesha'],
  } as Experience,
  {
    id: 1497,
    title: 'Kanheri Caves & Sanjay Gandhi National Park',
    tagline: '109 rock-cut Buddhist monastic caves carved into basalt hills from 1st century BCE',
    category: 'Heritage & History',
    city: 'Mumbai',
    state: 'Maharashtra',
    area_name: 'Borivali East, Mumbai',
    price: 25,
    rating: 4.86,
    review_count: 310,
    approx_duration_mins: 120,
    image_url: 'https://images.pexels.com/photos/18209328/pexels-photo-18209328.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    image_urls: ['https://images.pexels.com/photos/18209328/pexels-photo-18209328.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: false,
    tags: ['caves', 'buddhist', 'ancient', 'monastery'],
  } as Experience,
  {
    id: 3934,
    title: 'Haji Ali Dargah',
    tagline: '15th-century Indo-Islamic marble shrine on an islet 500m into the Arabian Sea',
    category: 'Spiritual & Wellness',
    city: 'Mumbai',
    state: 'Maharashtra',
    area_name: 'Mahalaxmi, Mumbai',
    price: 0,
    rating: 4.89,
    review_count: 360,
    approx_duration_mins: 60,
    image_url: 'https://images.pexels.com/photos/2643760/pexels-photo-2643760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    image_urls: ['https://images.pexels.com/photos/2643760/pexels-photo-2643760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: false,
    tags: ['dargah', 'spiritual', 'shrine', 'sea'],
  } as Experience,
  {
    id: 1094,
    title: 'Hawa Mahal (Palace of Winds)',
    tagline: 'Iconic 5-story pink honeycomb facade with 953 carved jharokhas (latticed windows)',
    category: 'Heritage & History',
    city: 'Jaipur',
    state: 'Rajasthan',
    area_name: 'Badi Choupad, Old City',
    price: 50,
    rating: 4.91,
    review_count: 460,
    approx_duration_mins: 60,
    image_url: '/api/v1/experiences/proxy-image?url=' + encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hawa_Mahal_2011.jpg/800px-Hawa_Mahal_2011.jpg'),
    image_urls: ['/api/v1/experiences/proxy-image?url=' + encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hawa_Mahal_2011.jpg/800px-Hawa_Mahal_2011.jpg')],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: false,
    tags: ['palace', 'jaipur', 'architecture', 'heritage'],
  } as Experience,
  {
    id: 2468,
    title: 'Albert Hall Museum & Victorian Royal Artifacts Gallery',
    tagline: 'Indo-Saracenic royal museum housing miniature paintings, armoury, and ancient relics',
    category: 'Heritage & History',
    city: 'Jaipur',
    state: 'Rajasthan',
    area_name: 'Ram Niwas Garden, Jaipur',
    price: 50,
    rating: 4.87,
    review_count: 275,
    approx_duration_mins: 90,
    image_url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80',
    image_urls: ['https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80'],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: true,
    tags: ['museum', 'architecture', 'artifacts', 'jaipur'],
  } as Experience,
  {
    id: 1098,
    title: 'Jaipur Traditional Blue Pottery Artisan Studio',
    tagline: 'GI-tagged Turko-Persian glazed pottery made without clay using quartz stone and glass',
    category: 'Art & Craft',
    city: 'Jaipur',
    state: 'Rajasthan',
    area_name: 'Kot Jewar / Sanganer Road',
    price: 350,
    rating: 4.93,
    review_count: 215,
    approx_duration_mins: 60,
    image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
    image_urls: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'],
    is_active: true,
    is_family_friendly: true,
    wheelchair_accessible: true,
    tags: ['blue pottery', 'artisan', 'craft', 'jaipur'],
  } as Experience,
];

export function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [experiences, setExperiences] = useState<Experience[]>(CURATED_LANDING_EXPERIENCES);
  const [selectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function loadInitial() {
      try {
        const list = await api.getLandingExperiences();
        if (list && list.length > 0) {
          setExperiences(list);
        }
      } catch (err) {
        console.error('Failed to load landing experiences, using curated default:', err);
      }
    }
    loadInitial();
  }, []);

  // GSAP ScrollTrigger setup for section reveals
  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.reveal-section, .reveal-word, .reveal-stagger-item', {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const sections = gsap.utils.toArray<HTMLElement>('.reveal-section');

      sections.forEach((section) => {
        const words = section.querySelectorAll('.reveal-word');
        const staggerItems = section.querySelectorAll('.reveal-stagger-item');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        });

        tl.fromTo(
          section,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          }
        );

        if (words.length > 0) {
          tl.fromTo(
            words,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power2.out',
            },
            '-=0.45'
          );
        }

        if (staggerItems.length > 0) {
          tl.fromTo(
            staggerItems,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
            },
            '-=0.3'
          );
        }
      });
    }, containerRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [isLoading, experiences, activeCategory]);

  const categories = [
    'All',
    'Heritage & History',
    'Spiritual & Wellness',
    'Nature & Wildlife',
    'Art & Craft',
  ];

  const filteredExperiences =
    activeCategory === 'All'
      ? experiences
      : experiences.filter((e) => e.category === activeCategory);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#EEF1EE] text-[#12213B] space-y-16 sm:space-y-24 pb-24 overflow-hidden">
      {/* LOKIVA HERO & 8-QUESTION CONTEXT FLOW */}
      <LokivaLandingHero />

      {/* CURATED EXPERIENCES CATALOG */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
              Curated Cultural Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              <SplitWords text="Verified Indian Cultural Experiences" />
            </h2>
            <p className="text-xs text-dusk-600">
              Each experience vetted for direct community spend, opening schedules, and step-free access.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs font-mono font-bold text-ink hover:text-marigold flex items-center gap-1.5 underline"
          >
            <span>View All Experiences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-ink text-white shadow-sm'
                  : 'bg-white text-dusk hover:text-ink border border-paper-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid with Sibling Cascade Stagger */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-paper-300 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredExperiences.map((exp) => (
              <div key={exp.id} className="reveal-stagger-item">
                <ExperienceCard experience={exp} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LOKIVA MOMENTS - IMMERSIVE VISUAL EXPERIENCE DISCOVERY */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LokivaMomentsSection experiences={experiences} selectedCity={selectedCity} />
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <FaqSection />

      {/* THE 11-SIGNAL CONTEXT ENGINE MANIFESTO */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-paper-400 p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
              Algorithmic Guarantees
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              <SplitWords text="The 11 Context Signals Checked on Every Solve" />
            </h3>
            <p className="text-xs text-dusk-600 leading-relaxed">
              Every competitor ranks single items in isolation. LOKIVA evaluates all 11 signals simultaneously to guarantee your plan works in real life.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-mono">
            {[
              { label: 'Time Window', desc: 'Exact hours before flight or dinner' },
              { label: 'Real Travel Time', desc: 'Isochrones with local auto traffic' },
              { label: 'Hard Budget Ceiling', desc: 'Not a sort filter, a strict ceiling' },
              { label: 'Hard Accessibility', desc: 'Wheelchair and sensory pre-filtered' },
              { label: 'Live Opening Hours', desc: 'Vetted slot fits inside your gap' },
              { label: 'Group Consensus', desc: 'Kids and elderly joint happiness' },
              { label: 'Explainability', desc: 'Honest "why this fits" sentence' },
              { label: 'Instant Re-Planning', desc: 'Rain and delay live adaptation' },
            ].map((sig, idx) => (
              <div
                key={idx}
                className="reveal-stagger-item p-4 bg-paper-100 rounded-2xl border border-paper-300 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-ink font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                  <span>{sig.label}</span>
                </div>
                <p className="text-[11px] text-dusk leading-snug font-sans">{sig.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
