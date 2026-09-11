import React from 'react';
import { Sprout, Globe, MessageSquare, CloudRain, TrendingUp, Sparkles, ShieldCheck, UserCheck, Smartphone, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenWhatsApp: () => void;
  toggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenWhatsApp,
  toggleRole,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const navItems = [
    { id: 'chat', label: t.navChat, icon: MessageSquare },
    { id: 'farm', label: t.navCloudFarm, icon: CloudRain },
    { id: 'market', label: t.navMarketPrices, icon: TrendingUp },
    { id: 'high_value', label: t.navHighValueCrops, icon: Sparkles },
    { id: 'schemes', label: t.navSchemes, icon: ShieldCheck },
    { id: 'officer', label: t.navOfficerPortal, icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-900/95 backdrop-blur-md border-b border-emerald-700/60 text-white shadow-lg">
      {/* Top Banner / Ticker */}
      <div className="bg-emerald-950/80 px-4 py-1 text-xs flex items-center justify-between border-b border-emerald-800/60 overflow-x-auto text-emerald-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 font-semibold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE AGRO-TELEMETRY
          </span>
          <span className="hidden sm:inline text-emerald-100">
            Guntur Teja Chilli: <strong>₹22,800/Q (+8.4%)</strong> | Warangal Cotton: <strong>₹7,920/Q</strong> | Guntur Rain Alert: <strong>15%</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={onOpenWhatsApp}
            className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors cursor-pointer"
            title="Connect WhatsApp Alerts"
          >
            <Smartphone className="w-3.5 h-3.5 text-green-400" />
            <span className="hidden md:inline font-medium">WhatsApp Sync:</span>
            <span className="inline-flex items-center gap-1 text-green-300 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-green-400" /> Connected
            </span>
          </button>
          <span className="text-emerald-500">|</span>
          <button
            onClick={toggleRole}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 cursor-pointer font-medium"
            title="Switch between Farmer and Agriculture Officer mode"
          >
            Role: <span className="underline decoration-amber-400/60 font-semibold uppercase">{user?.role === 'officer' ? t.roleOfficer : t.roleFarmer}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center shadow-md shadow-emerald-950/50">
              <Sprout className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">{t.appName}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  AI Agent
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 hidden sm:block truncate max-w-xs">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700/80 text-white shadow-sm border border-emerald-500/40'
                      : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lime-300' : 'text-emerald-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Multilingual Selector & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800/80 border border-emerald-600/60 text-emerald-100 hover:bg-emerald-700/80 text-sm cursor-pointer shadow-sm">
                <Globe className="w-4 h-4 text-emerald-300" />
                <span className="font-medium hidden sm:inline">
                  {LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName}
                </span>
                <span className="sm:hidden uppercase font-bold text-xs">{currentLanguage}</span>
              </div>

              {/* Language Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-emerald-700/70 rounded-xl shadow-2xl py-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider border-b border-emerald-800/50">
                  Select Language (6 Langs)
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-emerald-600/30 text-lime-300 font-bold'
                        : 'text-slate-200 hover:bg-emerald-800/50 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-normal">({lang.name})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth Profile or Login Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-800/60 border border-emerald-600/40 cursor-pointer hover:bg-emerald-700/60 transition"
                  title="View Account Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-lime-400 text-emerald-950 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <p className="font-semibold text-emerald-100 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-emerald-300">{user.district}, {user.state}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-emerald-300 hover:text-rose-300 hover:bg-emerald-800/60 transition cursor-pointer"
                  title={t.logoutButton}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-lime-400 to-emerald-400 text-emerald-950 font-bold text-sm shadow-md hover:brightness-105 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.loginButton}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Scrollbar */}
        <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-emerald-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold border border-emerald-500/40'
                    : 'bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lime-300' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
