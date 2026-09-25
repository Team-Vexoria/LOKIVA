import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface HeritageFlankClustersProps {
  heroRef?: React.RefObject<HTMLDivElement | null>;
  heroContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function HeritageFlankClusters({
  heroRef,
  heroContainerRef,
}: HeritageFlankClustersProps) {
  const { scrollY } = useScroll();

  // CALIBRATE EARLIER SCROLL RETRACTION:
  // Between 80px and 300px scroll offset, the clusters glide back into their outer corners and fade out completely
  const scrollLeftX = useTransform(scrollY, [80, 300], [0, -260]);
  const scrollRightX = useTransform(scrollY, [80, 300], [0, 260]);
  const scrollOpacity = useTransform(scrollY, [80, 240], [1, 0]);
  const scrollScale = useTransform(scrollY, [80, 300], [1, 0.9]);
  const scrollPointerEvents = useTransform(scrollY, (v) => (v >= 240 ? 'none' : 'auto'));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 hidden xl:block">
      {/* ── LEFT CLUSTER (SHIFTED HIGHER UP, ANCHORED FOR 70% VISIBILITY) ── */}
      <motion.div
        style={{
          x: scrollLeftX,
          opacity: scrollOpacity,
          scale: scrollScale,
          pointerEvents: scrollPointerEvents,
        }}
        className="absolute -left-12 top-24 w-[330px] h-[400px] pointer-events-auto"
      >
        {/* INITIAL MOUNT ENTRANCE (Diagonal slide from top-left corner) */}
        <motion.div
          initial={{ x: -280, y: -80, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative"
        >
          {/* Back Card (images1: Sacred Stepwells & Forts) */}
          <motion.div
            className="absolute top-0 left-0 w-[295px] h-[185px] rounded-3xl overflow-hidden shadow-xl border-4 border-[#FAF7F2] bg-[#FAF7F2] group cursor-pointer"
            style={{ rotate: -7, zIndex: 10 }}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 30, x: 15, transition: { duration: 0.25 } }}
          >
            <img
              src="/images1.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = '/images1';
                }
              }}
              alt="Sacred Stepwells & Forts"
              className="w-full h-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFC067] font-bold block">
                Chapter 01
              </span>
              <span className="text-xs font-heading font-extrabold text-white tracking-wide block">
                Sacred Stepwells &amp; Forts
              </span>
            </div>
          </motion.div>

          {/* Front Card (images2: Artisanal Guild Havens) */}
          <motion.div
            className="absolute top-[135px] left-6 w-[305px] h-[195px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FAF7F2] bg-[#FAF7F2] group cursor-pointer"
            style={{ rotate: 3, zIndex: 20 }}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 30, x: 15, transition: { duration: 0.25 } }}
          >
            <img
              src="/images2.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = '/images2';
                }
              }}
              alt="Artisanal Guild Havens"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFC067] font-bold block">
                Chapter 02
              </span>
              <span className="text-xs font-heading font-extrabold text-white tracking-wide block">
                Artisanal Guild Havens
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── RIGHT CLUSTER (SHIFTED HIGHER UP, ANCHORED FOR 70% VISIBILITY) ── */}
      <motion.div
        style={{
          x: scrollRightX,
          opacity: scrollOpacity,
          scale: scrollScale,
          pointerEvents: scrollPointerEvents,
        }}
        className="absolute -right-12 top-24 w-[330px] h-[400px] pointer-events-auto"
      >
        {/* INITIAL MOUNT ENTRANCE (Diagonal slide from top-right corner with 0.1s stagger) */}
        <motion.div
          initial={{ x: 280, y: -80, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.95, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative"
        >
          {/* Back Card (images3: Desert Citadels & Havens) */}
          <motion.div
            className="absolute top-0 right-0 w-[295px] h-[185px] rounded-3xl overflow-hidden shadow-xl border-4 border-[#FAF7F2] bg-[#FAF7F2] group cursor-pointer"
            style={{ rotate: 7, zIndex: 10 }}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 30, x: -15, transition: { duration: 0.25 } }}
          >
            <img
              src="/images3.avif"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = '/images3';
                }
              }}
              alt="Desert Citadels & Havens"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-4 right-4 text-white text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFC067] font-bold block">
                Chapter 03
              </span>
              <span className="text-xs font-heading font-extrabold text-white tracking-wide block">
                Desert Citadels &amp; Havens
              </span>
            </div>
          </motion.div>

          {/* Front Card (images4: Coastal Estuaries & Hearth) */}
          <motion.div
            className="absolute top-[135px] right-6 w-[305px] h-[195px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FAF7F2] bg-[#FAF7F2] group cursor-pointer"
            style={{ rotate: -3, zIndex: 20 }}
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 30, x: -15, transition: { duration: 0.25 } }}
          >
            <img
              src="/images4.jpg"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = '/images4';
                }
              }}
              alt="Coastal Estuaries & Hearth"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-3 left-4 right-4 text-white text-right">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFC067] font-bold block">
                Chapter 04
              </span>
              <span className="text-xs font-heading font-extrabold text-white tracking-wide block">
                Coastal Estuaries &amp; Hearth
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export const HeritageFlankFrames = HeritageFlankClusters;
export default HeritageFlankClusters;
