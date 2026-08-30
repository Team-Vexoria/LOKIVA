'use client';

import { useEffect, useRef, DependencyList } from 'react';
import { gsap, ScrollTrigger, SCROLL_REVEAL_CONFIG, isReducedMotionPreferred } from '../lib/gsap';

interface UseScrollRevealOptions {
  /**
   * Additional dependencies that should trigger a recalculation/refresh (e.g. API data loaded)
   */
  dependencies?: DependencyList;
  /**
   * Custom trigger start position (default: "top 85%")
   */
  start?: string;
  /**
   * Override reduced motion detection if needed
   */
  disabled?: boolean;
}

/**
 * Custom hook that initializes relume.ai style scroll-triggered reveals using GSAP + ScrollTrigger.
 * - Section reveals (y: 24 -> 0, opacity: 0 -> 1, ~0.6s, power2.out, once: true)
 * - Heading word reveals (y: 10 -> 0, opacity: 0 -> 1, ~0.04s stagger per word)
 * - Sibling/card staggers (y: 24 -> 0, opacity: 0 -> 1, ~0.08s stagger per child)
 * - Respects prefers-reduced-motion
 * - Auto cleans up on unmount via gsap.context()
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const containerRef = useRef<T>(null);
  const { dependencies = [], start = SCROLL_REVEAL_CONFIG.section.start, disabled = false } = options;

  useEffect(() => {
    if (disabled || typeof window === 'undefined' || !containerRef.current) return;

    const container = containerRef.current;
    const reducedMotion = isReducedMotionPreferred();

    // Create GSAP context for automatic cleanup on unmount
    const ctx = gsap.context(() => {
      // If user prefers reduced motion, set all elements to final visible state immediately with no transform
      if (reducedMotion) {
        gsap.set(
          container.querySelectorAll(
            '[data-reveal-section], [data-reveal-heading], [data-reveal-word], [data-reveal-stagger], [data-reveal-item], section'
          ),
          {
            opacity: 1,
            y: 0,
            clearProps: 'transform,opacity',
          }
        );
        return;
      }

      // 1. Heading Word-by-Word Reveals
      const headingElements = container.querySelectorAll<HTMLElement>('[data-reveal-heading]');
      headingElements.forEach((heading) => {
        const words = heading.querySelectorAll<HTMLElement>('[data-reveal-word]');
        if (words.length === 0) return;

        // Set initial state
        gsap.set(words, { opacity: 0, y: SCROLL_REVEAL_CONFIG.heading.y });

        // Scroll-triggered word stagger animation
        gsap.to(words, {
          opacity: 1,
          y: 0,
          duration: SCROLL_REVEAL_CONFIG.heading.duration,
          stagger: SCROLL_REVEAL_CONFIG.heading.wordStagger,
          ease: SCROLL_REVEAL_CONFIG.ease,
          scrollTrigger: {
            trigger: heading,
            start: start,
            once: true,
            toggleActions: 'play none none none',
          },
        });
      });

      // 2. Sibling / Grid Stagger Containers (cards, feature grids, categories, stats)
      const staggerContainers = container.querySelectorAll<HTMLElement>('[data-reveal-stagger]');
      staggerContainers.forEach((staggerBox) => {
        // Find children with data-reveal-item or direct children if not explicitly marked
        let items = staggerBox.querySelectorAll<HTMLElement>(':scope > [data-reveal-item]');
        if (items.length === 0) {
          items = staggerBox.querySelectorAll<HTMLElement>(':scope > *');
        }
        if (items.length === 0) return;

        // Set initial state for items
        gsap.set(items, { opacity: 0, y: SCROLL_REVEAL_CONFIG.stagger.y });

        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: SCROLL_REVEAL_CONFIG.stagger.duration,
          stagger: SCROLL_REVEAL_CONFIG.stagger.itemStagger,
          ease: SCROLL_REVEAL_CONFIG.ease,
          scrollTrigger: {
            trigger: staggerBox,
            start: start,
            once: true,
            toggleActions: 'play none none none',
          },
        });
      });

      // 3. Section-level Reveals
      // Find sections or elements marked with data-reveal-section that aren't themselves stagger containers
      const sections = container.querySelectorAll<HTMLElement>(
        '[data-reveal-section], section:not([data-reveal-ignore])'
      );

      sections.forEach((sec) => {
        // If the section is a direct container of words or stagger items, animate any standalone content
        const standaloneContent = sec.querySelectorAll<HTMLElement>(':scope > [data-reveal-content]');
        const target = standaloneContent.length > 0 ? standaloneContent : sec;

        // Only animate if the section itself hasn't already been handled as a pure stagger box
        if (!sec.hasAttribute('data-reveal-stagger')) {
          gsap.set(target, { opacity: 0, y: SCROLL_REVEAL_CONFIG.section.y });

          gsap.to(target, {
            opacity: 1,
            y: 0,
            duration: SCROLL_REVEAL_CONFIG.section.duration,
            ease: SCROLL_REVEAL_CONFIG.ease,
            scrollTrigger: {
              trigger: sec,
              start: start,
              once: true,
              toggleActions: 'play none none none',
            },
          });
        }
      });

      // Refresh ScrollTrigger calculations
      ScrollTrigger.refresh();
    }, container);

    return () => {
      ctx.revert(); // Reverts all GSAP animations and removes ScrollTriggers cleanly
    };
  }, [disabled, start, ...dependencies]);

  return containerRef;
}
