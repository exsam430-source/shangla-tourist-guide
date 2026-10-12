import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import ChatBot from '@/components/chatbot/ChatBot';
import ScrollToTop from '@/components/common/ScrollToTop';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AlertBanner from '@/components/home/AlertBanner';

import HomePage from '@/pages/HomePage';
import PlacesPage from '@/pages/PlacesPage';
import PlaceDetailPage from '@/pages/PlaceDetailPage';
import TripPlannerPage from '@/pages/TripPlannerPage';
import ImageRecognitionPage from '@/pages/ImageRecognitionPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import AlertsPage from '@/pages/AlertsPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Admin
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPlaces from '@/pages/admin/AdminPlaces';
import AdminPlaceForm from '@/pages/admin/AdminPlaceForm';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAlerts from '@/pages/admin/AdminAlerts';

import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';

function App() {
  const location = useLocation();
  const { i18n } = useTranslation();
  useAuth();
  useSocket();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <ScrollToTop />

      {/* Public site layout */}
      {!isAdminRoute && (
        <>
          <AlertBanner />
          <Navbar />
        </>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/places/:slug" element={<PlaceDetailPage />} />
          <Route path="/trip-planner" element={<TripPlannerPage />} />
          <Route path="/image-search" element={<ImageRecognitionPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="places" element={<AdminPlaces />} />
            <Route path="places/new" element={<AdminPlaceForm />} />
            <Route path="places/edit/:id" element={<AdminPlaceForm />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="alerts" element={<AdminAlerts />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>

      {/* ChatBot & Footer only on public pages */}
      {!isAdminRoute && (
        <>
          <ChatBot />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;