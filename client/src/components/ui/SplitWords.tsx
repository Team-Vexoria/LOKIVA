import React from 'react';

interface SplitWordsProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

export function SplitWords({ text, className = '', wordClassName = 'reveal-word' }: SplitWordsProps) {
  const words = text.split(' ');

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, idx) => (
        <span key={idx} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
          <span className={`inline-block ${wordClassName}`}>{word}</span>
        </span>
      ))}
    </span>
  );
}
