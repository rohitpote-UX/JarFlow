import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, AlertTriangle, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { sound } from '../../utils/sound';

export const NotificationModal: React.FC = () => {
  const {
    notifications,
    notificationsModalOpen,
    setNotificationsModalOpen,
    markNotificationsRead,
    settings,
  } = useApp();

  const isMr = settings.language === 'mr';

  if (!notificationsModalOpen) return null;

  const handleClose = () => {
    sound.playClick();
    markNotificationsRead();
    setNotificationsModalOpen(false);
  };

  const handleTestNotification = () => {
    sound.playSuccess();
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(isMr ? 'जलधारा - दैनिक स्मरणपत्र' : 'JarFlow Daily Alert', {
          body: isMr
            ? 'आज: २१ जार दिले, १५ परत आले, ₹५६० रोख जमा'
            : 'Today: 21 jars delivered, 15 returned, Rs 560 cash',
          icon: '/icons/icon.svg',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('JarFlow Active', {
              body: 'Push notifications enabled successfully!',
              icon: '/icons/icon.svg',
            });
          }
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-sheet space-y-3.5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-800 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {isMr ? 'सूचना व स्मरणपत्रे' : 'Notifications & Alerts'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isMr ? 'दैनिक हिशोब, साठा अलर्ट आणि उधारी आठवण' : 'Daily summary and payment alerts'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto text-xs">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-2xl border transition ${
                !n.read ? 'bg-blue-50/70 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900">{isMr ? n.titleMr : n.title}</span>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{isMr ? n.messageMr : n.message}</p>
            </div>
          ))}
        </div>

        {/* Test Push Button */}
        <div className="pt-2">
          <button
            onClick={handleTestNotification}
            className="w-full py-2.5 px-3 rounded-2xl bg-brand-50 hover:bg-blue-100 text-brand-800 text-xs font-bold flex items-center justify-center gap-1.5 active-press"
          >
            <Sparkles className="w-4 h-4 text-brand-700" />
            <span>{isMr ? '🔔 पुश नोटिफिकेशन टेस्ट करा' : '🔔 Test Push Notification'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
