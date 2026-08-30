'use client';

import React from 'react';

interface WordRevealHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'p' | 'span';
  children: React.ReactNode;
  className?: string;
}

/**
 * Splits text or nested elements into words wrapped in span tags with `data-reveal-word`
 * so GSAP ScrollTrigger can stagger them smoothly (0.03-0.05s per word).
 * Preserves gradient classes and child styling on individual words.
 */
export function WordRevealHeading({
  as: Component = 'h2',
  children,
  className = '',
  ...props
}: WordRevealHeadingProps) {
  let wordIndex = 0;

  const processChild = (node: React.ReactNode, inheritedClassName = ''): React.ReactNode => {
    if (typeof node === 'string' || typeof node === 'number') {
      const text = String(node);
      const tokens = text.split(/(\s+)/);

      return tokens.map((token, i) => {
        if (/^\s+$/.test(token)) {
          return token; // Preserve whitespace
        }
        const currentIdx = wordIndex++;
        return (
          <span
            key={`w-${currentIdx}-${i}`}
            data-reveal-word
            className={`reveal-word inline-block ${inheritedClassName}`}
            style={{ willChange: 'transform, opacity' }}
          >
            {token}
          </span>
        );
      });
    }

    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      const elementClassName = element.props.className || '';
      const combinedClassName = inheritedClassName
        ? `${inheritedClassName} ${elementClassName}`
        : elementClassName;

      if (element.props.children) {
        return React.cloneElement(
          element,
          {
            ...element.props,
            className: undefined, // Cleared on wrapper so styling applies to the split words
          },
          React.Children.map(element.props.children, (nestedChild) =>
            processChild(nestedChild, combinedClassName)
          )
        );
      }

      return node;
    }

    if (Array.isArray(node)) {
      return node.map((item, idx) => (
        <React.Fragment key={`frag-${idx}`}>
          {processChild(item, inheritedClassName)}
        </React.Fragment>
      ));
    }

    return node;
  };

  return (
    <Component
      data-reveal-heading
      className={`display-heading font-display ${className}`}
      {...props}
    >
      {React.Children.map(children, (child) => processChild(child))}
    </Component>
  );
}
