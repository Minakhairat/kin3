/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, Theme } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WhyKin } from './components/WhyKin';
import { ServicesOverview } from './components/ServicesOverview';
import { PricingCalculator } from './components/PricingCalculator';
import { Portfolio } from './components/Portfolio';
import { StudioAbout } from './components/StudioAbout';
import { BookingContact } from './components/BookingContact';
import { Footer } from './components/Footer';
import { PosterModal } from './components/PosterModal';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { ClientPortalModal } from './components/ClientPortalModal';
import { PromoBanner } from './components/PromoBanner';
import { ReviewsSection } from './components/ReviewsSection';
import { ReviewSubmitModal } from './components/ReviewSubmitModal';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kin_theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    return 'light';
  });
  const [pricingCategory, setPricingCategory] = useState<'podcasts' | 'reels'>('podcasts');
  
  // Modals state
  const [activePosterModal, setActivePosterModal] = useState<'podcasts' | 'reels' | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPkgId, setBookingPkgId] = useState<string | undefined>('podcast-doubleday');
  const [bookingAddons, setBookingAddons] = useState<string[]>([]);
  const [bookingTotal, setBookingTotal] = useState<number | undefined>(undefined);

  // Authentication & Portals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [isReviewSubmitModalOpen, setIsReviewSubmitModalOpen] = useState(false);

  // Sync RTL / LTR on html root
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Sync Theme class on html root and persist to localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('kin_theme', theme);
    } catch {
      // safe fallback
    }
  }, [theme]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenBooking = (pkgId?: string, customAddons?: string[], calculatedTotal?: number) => {
    if (pkgId) setBookingPkgId(pkgId);
    if (customAddons) setBookingAddons(customAddons);
    if (calculatedTotal) setBookingTotal(calculatedTotal);
    setIsBookingModalOpen(true);
  };

  const handleSelectServiceFromOverview = (category: 'podcasts' | 'reels' | 'commercials') => {
    if (category === 'commercials') {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setPricingCategory(category);
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen bg-[#FAFAFA] dark:bg-[#141211] text-[#141211] dark:text-[#FAFAFA] font-brand selection:bg-[#C82626] selection:text-white transition-colors duration-300 ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Top Dynamic Promotion Banner */}
      <PromoBanner
        lang={lang}
        onExplorePricing={() => {
          const el = document.getElementById('pricing');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3-Zone Clean Header with Portal Access */}
      <Header
        lang={lang}
        theme={theme}
        onToggleLang={toggleLang}
        onToggleTheme={toggleTheme}
        onOpenBooking={() => handleOpenBooking('podcast-doubleday')}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onOpenClientPortal={() => setIsClientPortalOpen(true)}
      />

      <main>
        {/* Hero Section with Clean Instagram Profile Showcase */}
        <Hero
          lang={lang}
          onOpenBooking={() => handleOpenBooking('podcast-doubleday')}
        />

        {/* 6 Core Strength Pillars (Why KIN) */}
        <WhyKin lang={lang} />

        {/* Specialized Production Services */}
        <ServicesOverview
          lang={lang}
          onSelectService={handleSelectServiceFromOverview}
          onOpenBooking={handleOpenBooking}
        />

        {/* Official Packages & Real-Time Interactive Calculator */}
        <PricingCalculator
          lang={lang}
          activeCategory={pricingCategory}
          onCategoryChange={setPricingCategory}
          onOpenBooking={handleOpenBooking}
          onViewPoster={(type) => setActivePosterModal(type)}
        />

        {/* Official KIN Instagram Portal */}
        <Portfolio lang={lang} />

        {/* Real Verified Client Reviews & Testimonials Section */}
        <ReviewsSection
          lang={lang}
          onOpenAddReview={() => setIsReviewSubmitModalOpen(true)}
        />

        {/* Studio & Korba Heritage */}
        <StudioAbout
          lang={lang}
          onOpenBooking={() => handleOpenBooking('podcast-doubleday')}
        />

        {/* Booking Form, Direct Numbers & Korba Studio Map */}
        <BookingContact
          lang={lang}
          preselectedPackageId={bookingPkgId}
          preselectedAddons={bookingAddons}
          calculatedTotal={bookingTotal}
        />
      </main>

      {/* Clean Minimalist Footer */}
      <Footer lang={lang} />

      {/* Official Price Sheet Poster Modal */}
      {activePosterModal && (
        <PosterModal
          initialType={activePosterModal}
          lang={lang}
          onClose={() => setActivePosterModal(null)}
        />
      )}

      {/* Quick Session Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        initialPackageId={bookingPkgId}
        initialAddons={bookingAddons}
        calculatedTotal={bookingTotal}
        lang={lang}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Authentication & User Hub Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        lang={lang}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        onOpenClientPortal={() => setIsClientPortalOpen(true)}
      />

      {/* Admin Portal (Links Creator, Client Restrictor, Revisions) */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        lang={lang}
        onClose={() => setIsAdminPortalOpen(false)}
        onOpenClientPortal={() => setIsClientPortalOpen(true)}
      />

      {/* Client Portal (Secure Link Viewer, Revisions Feedback) */}
      <ClientPortalModal
        isOpen={isClientPortalOpen}
        lang={lang}
        onClose={() => setIsClientPortalOpen(false)}
        onOpenBooking={() => handleOpenBooking('podcast-doubleday')}
      />

      {/* Verified Client Review Submission Modal */}
      <ReviewSubmitModal
        isOpen={isReviewSubmitModalOpen}
        lang={lang}
        onClose={() => setIsReviewSubmitModalOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

    </div>
  );
}
