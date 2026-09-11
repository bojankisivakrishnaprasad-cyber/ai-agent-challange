import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { CloudFarmView } from './components/CloudFarmView';
import { MarketPricesView } from './components/MarketPricesView';
import { HighValueCropsView } from './components/HighValueCropsView';
import { SchemesView } from './components/SchemesView';
import { OfficerDashboardView } from './components/OfficerDashboardView';
import { AuthModal } from './components/AuthModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { LanguageCode, UserProfile } from './types';
import { TRANSLATIONS } from './data/translations';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('kisan_lang');
    return (saved as LanguageCode) || 'en';
  });

  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppPrefillText, setWhatsAppPrefillText] = useState<string>('');

  // Default authenticated user (Ramesh Patel - Farmer, Guntur)
  const [user, setUser] = useState<UserProfile | null>(() => {
    return {
      id: 'usr_farmer_demo',
      name: 'Ramesh Patel',
      identifier: '9876543210',
      type: 'phone',
      role: 'farmer',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Prathipadu',
      soilType: 'Black Cotton Clay Loam',
      farmSizeAcres: 4.5,
      primaryCrops: ['Cotton (Bt)', 'Chilli (Teja)'],
      waterSource: 'Borewell & Drip Irrigation',
      whatsAppConnected: true,
      whatsAppNumber: '+91 98765 43210',
      verified: true,
    };
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('kisan_lang', lang);
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleOpenWhatsApp = (customText?: string) => {
    if (customText) {
      setWhatsAppPrefillText(customText);
    }
    setIsWhatsAppOpen(true);
  };

  const toggleRole = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const newRole = user.role === 'farmer' ? 'officer' : 'farmer';
    setUser({
      ...user,
      role: newRole,
      name: newRole === 'officer' ? 'Dr. Ananya Sharma' : 'Ramesh Patel',
    });
    if (newRole === 'officer') {
      setActiveTab('officer');
    } else {
      setActiveTab('chat');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Soft Radial Gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-900/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-10 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenWhatsApp={() => handleOpenWhatsApp()}
        toggleRole={toggleRole}
      />

      {/* Main Tab Content */}
      <main className="flex-1 z-10 flex flex-col">
        {activeTab === 'chat' && (
          <ChatView
            currentLanguage={currentLanguage}
            user={user}
            onOpenWhatsApp={handleOpenWhatsApp}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'farm' && (
          <CloudFarmView
            currentLanguage={currentLanguage}
            user={user}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        )}

        {activeTab === 'market' && (
          <MarketPricesView
            currentLanguage={currentLanguage}
            user={user}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        )}

        {activeTab === 'high_value' && (
          <HighValueCropsView
            currentLanguage={currentLanguage}
            user={user}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        )}

        {activeTab === 'schemes' && (
          <SchemesView
            currentLanguage={currentLanguage}
            user={user}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        )}

        {activeTab === 'officer' && (
          <OfficerDashboardView
            currentLanguage={currentLanguage}
            user={user}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        )}
      </main>

      {/* Auth Modal (Hashed storage, OTP, Phone/Email) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentLanguage={currentLanguage}
        currentUser={user}
      />

      {/* WhatsApp Cloud Connect & Click-to-Chat Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        user={user}
        initialText={whatsAppPrefillText}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
