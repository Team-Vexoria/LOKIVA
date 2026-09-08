import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 text-center text-ink">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-paper-400 text-marigold flex items-center justify-center mx-auto shadow-md">
          <Compass className="w-8 h-8 text-ink" />
        </div>
        <h1 className="text-4xl font-extrabold font-display text-ink">404</h1>
        <h2 className="text-xl font-bold font-display text-ink">Destination Not Found</h2>
        <p className="text-xs text-dusk-600 font-sans">
          The page or cultural route you were looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-ink text-paper rounded-xl text-xs font-mono font-bold shadow-md"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
