import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Sparkles } from 'lucide-react';

interface ProjectVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export function ProjectVideoModal({
  isOpen,
  onClose,
  videoUrl,
}: ProjectVideoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-3xl bg-white rounded-3xl border border-[#E5DFD5] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF1EE] bg-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C1443B]" />
                <h3 className="font-display font-bold text-base sm:text-lg text-[#12213B]">
                  LOKIVA: Project Overview
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white hover:bg-paper-200 border border-[#DDD7CC] flex items-center justify-center text-[#5B6B8C] hover:text-[#12213B] transition cursor-pointer"
                aria-label="Close video player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="aspect-video bg-[#12213B] relative flex flex-col items-center justify-center p-6 text-center text-white">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  title="LOKIVA Project Overview"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-3 group hover:scale-110 transition cursor-pointer shadow-lg">
                    <Play className="w-7 h-7 text-[#FFC067] fill-current ml-1" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-white">
                    Video Player Ready
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-gray-300 max-w-md mt-1">
                    Once your Google NotebookLM video is ready, we will embed it directly here.
                  </p>
                  <div className="mt-4 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 font-mono text-[11px] text-[#FFC067]">
                    Ready to plug in YouTube, Vimeo, or MP4 URL
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProjectVideoModal;
