import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme-context';
import { AppHeader } from '../components/layout/AppHeader';

export const metadata: Metadata = {
  title: 'LOKIVA — Intelligent Local Discovery & Experience Platform',
  description:
    'Discover authentic local food, cultural workshops, and hidden gems that fit your time, budget, interests, and walking preferences across India.',
  keywords: ['travel', 'local experiences', 'india', 'itinerary planner', 'ai travel concierge', 'hidden gems', 'cultural workshops', 'provider business', 'admin portal']
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <AppHeader />
            <main className="flex-1 flex flex-col">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
