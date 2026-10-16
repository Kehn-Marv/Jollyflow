import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/Sonner';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ScrollManager } from './components/layout/ScrollManager';
import { PublicLayout } from './components/layout/PublicLayout';
import { RequireAuth } from './components/layout/RequireAuth';
import { RouteFallback } from './components/layout/RouteFallback';
import { Home } from './pages/marketing/Home';

/** Route-level code splitting: only the landing page ships in the first bundle. */
const named = <T extends Record<string, React.ComponentType<any>>,>(loader: () => Promise<T>, key: keyof T) =>
lazy(() => loader().then((m) => ({ default: m[key] as React.ComponentType<any> })));

const AppShell = named(() => import('./components/layout/AppShell'), 'AppShell');
const Manifesto = named(() => import('./pages/marketing/Manifesto'), 'Manifesto');
const FeaturePlanning = named(() => import('./pages/marketing/FeaturePlanning'), 'FeaturePlanning');
const FeatureGifting = named(() => import('./pages/marketing/FeatureGifting'), 'FeatureGifting');
const FeatureVendors = named(() => import('./pages/marketing/FeatureVendors'), 'FeatureVendors');
const UseCaseWeddings = named(() => import('./pages/marketing/UseCaseWeddings'), 'UseCaseWeddings');
const UseCaseParties = named(() => import('./pages/marketing/UseCaseParties'), 'UseCaseParties');
const UseCaseLiveEvents = named(() => import('./pages/marketing/UseCaseLiveEvents'), 'UseCaseLiveEvents');
const Privacy = named(() => import('./pages/marketing/Privacy'), 'Privacy');
const Terms = named(() => import('./pages/marketing/Terms'), 'Terms');
const Explore = named(() => import('./pages/public/Explore'), 'Explore');
const PublicEvent = named(() => import('./pages/public/PublicEvent'), 'PublicEvent');
const Checkout = named(() => import('./pages/public/Checkout'), 'Checkout');
const VendorDirectory = named(() => import('./pages/public/VendorDirectory'), 'VendorDirectory');
const VendorProfile = named(() => import('./pages/public/VendorProfile'), 'VendorProfile');
const SignIn = named(() => import('./pages/auth/SignIn'), 'SignIn');
const SignUp = named(() => import('./pages/auth/SignUp'), 'SignUp');
const RecoverPassword = named(() => import('./pages/auth/RecoverPassword'), 'RecoverPassword');
const Onboarding = named(() => import('./pages/auth/Onboarding'), 'Onboarding');
const Dashboard = named(() => import('./pages/app/Dashboard'), 'Dashboard');
const Events = named(() => import('./pages/app/Events'), 'Events');
const CreateEvent = named(() => import('./pages/app/CreateEvent'), 'CreateEvent');
const EventWorkspace = named(() => import('./pages/app/EventWorkspace'), 'EventWorkspace');
const Settings = named(() => import('./pages/app/Settings'), 'Settings');
const CheckIn = named(() => import('./pages/app/CheckIn'), 'CheckIn');
const NotFound = named(() => import('./pages/NotFound'), 'NotFound');

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ScrollManager />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
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

              <Route element={<PublicLayout hideFooter />}>
                <Route path="/manifesto" element={<Manifesto />} />
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
          </Suspense>
          <Toaster position="bottom-right" closeButton />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>);

}