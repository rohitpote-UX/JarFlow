import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/sound';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { settings } = useApp();
  const isMr = settings.language === 'mr';

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    if (localStorage.getItem('jarflow_pwa_dismissed') === 'true') {
      return;
    }

    // Check if already installed in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If on iOS and not standalone, show once after 3 seconds
    if (isIosDevice) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('jarflow_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    sound.playClick();
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      handleDismiss();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="relative z-20 mx-3 mt-2 mb-1 max-w-md md:mx-auto bg-gradient-to-r from-brand-900 to-brand-800 text-white p-2.5 rounded-2xl shadow-md border border-blue-500/30 animate-fade-in flex items-center justify-between gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
          <Download className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <h4 className="font-extrabold leading-tight">
            {isMr ? 'अ‍ॅप इन्स्टॉल करा' : 'Install JarFlow App'}
          </h4>
          <p className="text-[10px] text-blue-200">
            {isIOS
              ? isMr
                ? 'Share → Add to Home Screen'
                : 'Share → Add to Home Screen'
              : isMr
              ? 'ऑफलाइन वापरा व थेट स्क्रीनवरून उघडा'
              : 'Works offline with instant launch'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 rounded-xl bg-white text-brand-900 font-extrabold text-[11px] active-press shadow-sm"
          >
            {isMr ? 'इन्स्टॉल' : 'Install'}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 active-press"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
