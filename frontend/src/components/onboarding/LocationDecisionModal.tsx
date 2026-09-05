import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map, Search, Sparkles, Compass, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LocationDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationDecisionModal({ isOpen, onClose }: LocationDecisionModalProps) {
  const navigate = useNavigate();
  const [hasMadeChoice, setHasMadeChoice] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const hasOnboarded = localStorage.getItem('has_onboarded_lokiva');
    if (hasOnboarded) {
      // User has already onboarded, but modal might be shown manually
      setHasMadeChoice(true);
    }
  }, []);

  const handleOptionA = () => {
    // User knows where they want to go
    localStorage.setItem('has_onboarded_lokiva', 'true');
    setHasMadeChoice(true);
    onClose();
    navigate('/explore');
  };

  const handleOptionB = () => {
    // User wants help deciding
    localStorage.setItem('has_onboarded_lokiva', 'true');
    setHasMadeChoice(true);
    onClose();
    navigate('/discovery-map');
  };

  const handleSkip = () => {
    // Skip onboarding but don't mark as completed (user can reopen)
    setHasMadeChoice(true);
    onClose();
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.2 }
    }
  };

  if (!isOpen || hasMadeChoice) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-ink/75 backdrop-blur-md overflow-y-auto"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="relative w-full max-w-lg mx-auto my-auto max-h-[calc(100vh-2.5rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-marigold/10 via-teal/5 to-transparent rounded-3xl blur-3xl -z-10"></div>
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-marigold/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal/20 rounded-full blur-2xl -z-10"></div>

            {/* Main Modal */}
            <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl border border-paper-400 shadow-2xl overflow-hidden flex flex-col max-h-full">
              {/* Header */}
              <div className="p-5 sm:p-6 text-center border-b border-paper-300 flex-shrink-0">
                <div className="flex items-center justify-center gap-2.5 mb-2.5">
                  <div className="p-2 bg-marigold/10 rounded-xl">
                    <Compass className="w-6 h-6 text-marigold" />
                  </div>
                  <div className="p-2 bg-teal/10 rounded-xl">
                    <Navigation className="w-6 h-6 text-teal" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-bold text-ink mb-1">
                  Welcome to <span className="text-marigold">LOKIVA</span>
                </h2>
                <p className="text-xs sm:text-sm text-dusk-600 leading-relaxed max-w-md mx-auto">
                  How would you like to start your Indian cultural journey today?
                </p>
              </div>

              {/* Decision Options */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
                <motion.div
                  className="group cursor-pointer"
                  variants={optionVariants}
                  onClick={handleOptionA}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="bg-white border-2 border-paper-400 rounded-2xl p-4 sm:p-5 hover:border-marigold/50 hover:shadow-md transition-all duration-300 group-hover:bg-marigold/5">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 bg-paper rounded-xl group-hover:bg-white transition-colors shrink-0">
                        <Search className="w-5 h-5 text-ink group-hover:text-marigold transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-marigold transition-colors">
                            I know where I want to go
                          </h3>
                          <span className="text-[11px] font-mono font-bold text-dusk bg-paper-200 px-2 py-0.5 rounded-full shrink-0">
                            Direct Search
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-dusk-600 mb-2.5">
                          Jump straight to search and planning tools for your specific destination
                        </p>
                        <div className="flex items-center gap-1 text-xs font-mono text-teal font-bold">
                          <span>Go to Explore →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="group cursor-pointer"
                  variants={optionVariants}
                  onClick={handleOptionB}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="bg-white border-2 border-paper-400 rounded-2xl p-4 sm:p-5 hover:border-teal/50 hover:shadow-md transition-all duration-300 group-hover:bg-teal/5">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 bg-paper rounded-xl group-hover:bg-white transition-colors shrink-0">
                        <Map className="w-5 h-5 text-ink group-hover:text-teal transition-colors" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-ink group-hover:text-teal transition-colors">
                            Help me decide / Explore India
                          </h3>
                          <span className="text-[11px] font-mono font-bold text-dusk bg-paper-200 px-2 py-0.5 rounded-full shrink-0">
                            Interactive Discovery
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-dusk-600 mb-2.5">
                          Experience India through our interactive map to find hidden gems and plan visually
                        </p>
                        <div className="flex items-center gap-1 text-xs font-mono text-teal font-bold">
                          <Sparkles className="w-3 h-3" />
                          <span>Launch Interactive Map →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Skip Option */}
                <div className="pt-2 border-t border-paper-200 text-center">
                  <button
                    onClick={handleSkip}
                    className="text-xs sm:text-sm text-dusk hover:text-ink transition-colors font-medium py-1 px-3"
                  >
                    Skip for now, I'll explore later
                  </button>
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-paper/50 px-4 py-2.5 border-t border-paper-300 flex-shrink-0">
                <p className="text-[11px] sm:text-xs text-dusk text-center">
                  You can always reopen this map from the navigation bar • Your choice will be remembered
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 text-dusk hover:text-ink transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to check if user has onboarded and control modal
export function useOnboardingGate() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already onboarded
    const hasOnboarded = localStorage.getItem('has_onboarded_lokiva');

    // Small delay to ensure page is loaded
    const timer = setTimeout(() => {
      if (!hasOnboarded) {
        setShowModal(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    showModal,
    openModal,
    closeModal
  };
}
