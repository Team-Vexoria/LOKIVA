'use client';

import React, { DependencyList, ElementType } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { WordRevealHeading } from './WordRevealHeading';

export { WordRevealHeading };

interface ScrollRevealContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  dependencies?: DependencyList;
  start?: string;
  disabled?: boolean;
}

/**
 * Top-level container component that orchestrates relume.ai style scroll reveals for all child sections,
 * display headings, and item grids.
 */
export function ScrollRevealContainer({
  children,
  className = '',
  dependencies,
  start,
  disabled,
  ...props
}: ScrollRevealContainerProps) {
  const containerRef = useScrollReveal<HTMLDivElement>({
    dependencies,
    start,
    disabled,
  });

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}

type PolymorphicProps<E extends ElementType, P = object> = P &
  Omit<React.ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    as?: E;
  };

/**
 * Marks a block for section-level reveal (opacity 0 -> 1, translateY 24px -> 0 over 0.6s, power2.out)
 */
export function ScrollRevealSection<E extends ElementType = 'section'>({
  as,
  children,
  className = '',
  ...props
}: PolymorphicProps<E, { children: React.ReactNode; className?: string }>) {
  const Component = as || 'section';
  return (
    <Component data-reveal-section className={className} {...props}>
      {children}
    </Component>
  );
}

/**
 * Container that cascades / staggers sibling items (~0.08s delay between siblings)
 */
export function ScrollRevealStagger<E extends ElementType = 'div'>({
  as,
  children,
  className = '',
  ...props
}: PolymorphicProps<E, { children: React.ReactNode; className?: string }>) {
  const Component = as || 'div';
  return (
    <Component data-reveal-stagger className={className} {...props}>
      {children}
    </Component>
  );
}

/**
 * Individual item inside a ScrollRevealStagger container
 */
export function ScrollRevealItem<E extends ElementType = 'div'>({
  as,
  children,
  className = '',
  ...props
}: PolymorphicProps<E, { children: React.ReactNode; className?: string }>) {
  const Component = as || 'div';
  return (
    <Component data-reveal-item className={className} {...props}>
      {children}
    </Component>
  );
}
