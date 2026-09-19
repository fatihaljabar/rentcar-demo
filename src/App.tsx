import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AppProvider, useApp } from './store';
import { AdminLayout, PublicLayout } from './components/Layout';
import { EmptyState, Icon } from './components/ui';
import { HomePage } from './pages/Home';
const CorporatePage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.CorporatePage })));
const FleetDetailPage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.FleetDetailPage })));
const FleetPage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.FleetPage })));
const PackagesPage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.PackagesPage })));
const TermsPage = lazy(() => import('./pages/PublicPages').then(module => ({ default: module.TermsPage })));
const BookingPage = lazy(() => import('./pages/Booking').then(module => ({ default: module.BookingPage })));
const BookingSuccessPage = lazy(() => import('./pages/Booking').then(module => ({ default: module.BookingSuccessPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const AdminLoginPage = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminLoginPage })));
const AdminBookings = lazy(() => import('./pages/AdminBookings').then(module => ({ default: module.AdminBookings })));
const AdminCustomersPage = lazy(() => import('./pages/AdminData').then(module => ({ default: module.AdminCustomersPage })));
const AdminFleetPage = lazy(() => import('./pages/AdminData').then(module => ({ default: module.AdminFleetPage })));
const AdminPaymentsPage = lazy(() => import('./pages/AdminData').then(module => ({ default: module.AdminPaymentsPage })));
const AdminPricingPage = lazy(() => import('./pages/AdminData').then(module => ({ default: module.AdminPricingPage })));
const EntityPage = lazy(() => import('./pages/AdminData').then(module => ({ default: module.EntityPage })));
const AdminDocumentsPage = lazy(() => import('./pages/AdminDocuments').then(module => ({ default: module.AdminDocumentsPage })));
const AdminCalendarPage = lazy(() => import('./pages/AdminOperations').then(module => ({ default: module.AdminCalendarPage })));
const AdminGPSPage = lazy(() => import('./pages/AdminOperations').then(module => ({ default: module.AdminGPSPage })));
const AdminReportsPage = lazy(() => import('./pages/AdminOperations').then(module => ({ default: module.AdminReportsPage })));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) { const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120); return () => clearTimeout(timer); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}
function NotFound() { const { t } = useApp(); return <div className="container section-space not-found"><span className="eyebrow">404 / A LITTLE DETOUR</span><EmptyState title={t('Sepertinya kita salah belok.', 'Looks like we took a wrong turn.')} description={t('Halaman ini tidak ditemukan. Mari kembali ke perjalanan Anda.', 'This page could not be found. Let us get you back on track.')} icon="route" action={<Link to="/" className="btn btn-primary">{t('Kembali ke beranda', 'Back to home')}<Icon name="arrow-right" /></Link>} /></div>; }
export default function App() {
  return <MotionConfig reducedMotion="user"><AppProvider><BrowserRouter><ScrollManager /><Suspense fallback={<div className="route-loading" aria-label="Loading page" />}><Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      <Route path="armada" element={<FleetPage />} />
      <Route path="armada/:id" element={<FleetDetailPage />} />
      <Route path="paket" element={<PackagesPage />} />
      <Route path="corporate" element={<CorporatePage />} />
      <Route path="booking" element={<BookingPage />} />
      <Route path="booking/success/:id" element={<BookingSuccessPage />} />
      <Route path="ketentuan" element={<TermsPage />} />
    </Route>
    <Route path="admin/login" element={<AdminLoginPage />} />
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="booking" element={<AdminBookings />} />
      <Route path="corporate-request" element={<AdminBookings key="corporate" corporateOnly />} />
      <Route path="vendor" element={<EntityPage key="vendors" entity="vendors" />} />
      <Route path="armada" element={<AdminFleetPage />} />
      <Route path="kalender" element={<AdminCalendarPage />} />
      <Route path="lokasi" element={<AdminGPSPage />} />
      <Route path="driver" element={<EntityPage key="drivers" entity="drivers" />} />
      <Route path="customer" element={<AdminCustomersPage />} />
      <Route path="harga" element={<AdminPricingPage />} />
      <Route path="pembayaran" element={<AdminPaymentsPage />} />
      <Route path="quotation" element={<AdminDocumentsPage key="quotation" type="Quotation" />} />
      <Route path="invoice" element={<AdminDocumentsPage key="invoice" type="Invoice" />} />
      <Route path="maintenance" element={<EntityPage key="maintenance" entity="maintenance" />} />
      <Route path="laporan" element={<AdminReportsPage />} />
    </Route>
    <Route element={<PublicLayout />}><Route path="*" element={<NotFound />} /></Route>
  </Routes></Suspense></BrowserRouter></AppProvider></MotionConfig>;
}
