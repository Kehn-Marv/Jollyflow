import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/Sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ScrollManager } from './components/layout/ScrollManager';
import { PublicLayout } from './components/layout/PublicLayout';
import { RequireAuth } from './components/layout/RequireAuth';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/marketing/Home';
import { About } from './pages/marketing/About';
import { Manifesto } from './pages/marketing/Manifesto';
import { FeaturePlanning } from './pages/marketing/FeaturePlanning';
import { FeatureGifting } from './pages/marketing/FeatureGifting';
import { FeatureVendors } from './pages/marketing/FeatureVendors';
import { UseCaseWeddings } from './pages/marketing/UseCaseWeddings';
import { UseCaseParties } from './pages/marketing/UseCaseParties';
import { UseCaseLiveEvents } from './pages/marketing/UseCaseLiveEvents';
import { Privacy } from './pages/marketing/Privacy';
import { Terms } from './pages/marketing/Terms';
import { Explore } from './pages/public/Explore';
import { PublicEvent } from './pages/public/PublicEvent';
import { Checkout } from './pages/public/Checkout';
import { VendorDirectory } from './pages/public/VendorDirectory';
import { VendorProfile } from './pages/public/VendorProfile';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { RecoverPassword } from './pages/auth/RecoverPassword';
import { Onboarding } from './pages/auth/Onboarding';
import { Dashboard } from './pages/app/Dashboard';
import { Events } from './pages/app/Events';
import { CreateEvent } from './pages/app/CreateEvent';
import { EventWorkspace } from './pages/app/EventWorkspace';
import { Settings } from './pages/app/Settings';
import { CheckIn } from './pages/app/CheckIn';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ScrollManager />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/manifesto" element={<Manifesto />} />
              <Route path="/features/planning" element={<FeaturePlanning />} />
              <Route path="/features/gifting" element={<FeatureGifting />} />
              <Route path="/features/vendors" element={<FeatureVendors />} />
              <Route path="/use-cases/weddings" element={<UseCaseWeddings />} />
              <Route path="/use-cases/parties" element={<UseCaseParties />} />
              <Route path="/use-cases/live-events" element={<UseCaseLiveEvents />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/vendors" element={<VendorDirectory />} />
              <Route path="/vendors/:vendorId" element={<VendorProfile />} />
            </Route>

            <Route path="/events/:slug" element={<PublicEvent />} />
            <Route path="/events/:slug/checkout" element={<Checkout />} />

            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/recover" element={<RecoverPassword />} />
            <Route path="/onboarding" element={<RequireAuth allowUnonboarded><Onboarding /></RequireAuth>} />

            <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="events/new" element={<CreateEvent />} />
              <Route path="events/:eventId/:tab?" element={<EventWorkspace />} />
              <Route path="vendors" element={<VendorDirectory inApp />} />
              <Route path="vendors/:vendorId" element={<VendorProfile inApp />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/check-in/:eventId" element={<RequireAuth><CheckIn /></RequireAuth>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="bottom-right" closeButton />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>);

}