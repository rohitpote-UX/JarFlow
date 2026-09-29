import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Bell, WifiOff, Box, Smartphone, Monitor } from 'lucide-react';
import { sound } from '../../utils/sound';

export const Header: React.FC = () => {
  const {
    settings,
    availableJars,
    isOnline,
    notifications,
    toggleLanguage,
    setGlobalSearchOpen,
    setJarModalOpen,
    setNotificationsModalOpen,
    setSettingsModalOpen,
    mobileFrameView,
    setMobileFrameView,
  } = useApp();

  const isMr = settings.language === 'mr';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-surface-border px-4 py-2.5 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Business Info */}
        <div
          onClick={() => setSettingsModalOpen(true)}
          className="flex items-center gap-2.5 cursor-pointer active:opacity-80 transition"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-800 to-brand-600 flex items-center justify-center text-white shadow-button">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" fillOpacity="0.25" />
              <path d="M8 2h8v3H8z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-surface-dark leading-tight tracking-tight">
                {settings.businessName}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-brand-800">
                PWA
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {isMr ? 'जल व्यवस्थापन प्रणाली' : 'Water Distribution System'}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Quick Godown Stock Pill */}
          <button
            onClick={() => {
              sound.playClick();
              setJarModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-800 text-xs font-semibold active-press border border-blue-200/60"
            title={isMr ? 'गोदाम साठा तपासा' : 'Godown Stock'}
          >
            <Box className="w-3.5 h-3.5 text-brand-600" />
            <span>{availableJars}</span>
            <span className="text-[11px] text-gray-500 font-normal">
              {isMr ? 'शिल्लक' : 'stock'}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 active-press"
            title="Switch Language (मराठी / English)"
          >
            {isMr ? 'मराठी' : 'ENG'}
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              setGlobalSearchOpen(true);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 active-press"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              sound.playClick();
              setNotificationsModalOpen(true);
            }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-100 active-press"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            )}
          </button>

          {/* Desktop Frame / Responsive View Switcher */}
          <button
            onClick={() => {
              sound.playClick();
              setMobileFrameView((prev) => !prev);
            }}
            className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-gray-600 hover:bg-gray-100 active-press"
            title={mobileFrameView ? 'Switch to Full Screen' : 'Switch to Mobile Mockup Frame'}
          >
            {mobileFrameView ? (
              <Monitor className="w-4 h-4 text-brand-700" />
            ) : (
              <Smartphone className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Offline Alert Bar */}
      {!isOnline && (
        <div className="mt-2 py-1 px-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-amber-800 animate-fade-in">
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isMr
              ? 'ऑफलाइन मोड: सर्व नोंदी फोनमध्ये सुरक्षित आहेत, इंटरनेट सुरू झाल्यावर सिंक होतील.'
              : 'Offline Mode: Transactions saved locally and will auto-sync when online.'}
          </span>
        </div>
      )}
    </header>
  );
};
