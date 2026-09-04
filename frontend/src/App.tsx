import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { DestinationsPage } from './pages/DestinationsPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';
import { AiGuidePage } from './pages/AiGuidePage';
import { ItineraryPage } from './pages/ItineraryPage';
import { SavedPage } from './pages/SavedPage';
import { ProfilePage } from './pages/ProfilePage';
import { DiscoveryMapPage } from './pages/DiscoveryMapPage';
import { LocationDecisionModal, useOnboardingGate } from './components/onboarding/LocationDecisionModal';
import { LoginPage } from './pages/LoginPage';
import { TravelerLoginPage } from './pages/TravelerLoginPage';
import { ProviderLoginPage } from './pages/ProviderLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { TravelerRegisterPage } from './pages/TravelerRegisterPage';
import { ProviderRegisterPage } from './pages/ProviderRegisterPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const { showModal, closeModal } = useOnboardingGate();

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-paper text-ink font-sans selection:bg-marigold selection:text-ink">
          <Navbar />
          <main className="flex-1 pt-16 sm:pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/destination/:state/:city" element={<DestinationDetailPage />} />
              <Route path="/experience/:id" element={<ExperienceDetailPage />} />
              <Route path="/ai-guide" element={<AiGuidePage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/discovery-map" element={<DiscoveryMapPage />} />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login/traveler" element={<TravelerLoginPage />} />
              <Route path="/login/provider" element={<ProviderLoginPage />} />
              <Route path="/login/admin" element={<AdminLoginPage />} />
              <Route path="/register/traveler" element={<TravelerRegisterPage />} />
              <Route path="/register/provider" element={<ProviderRegisterPage />} />

              {/* Portal routes */}
              <Route path="/provider" element={<ProviderDashboardPage />} />
              <Route path="/provider/*" element={<ProviderDashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/*" element={<AdminDashboardPage />} />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />

          {/* First-visit onboarding modal */}
          <LocationDecisionModal isOpen={showModal} onClose={closeModal} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
