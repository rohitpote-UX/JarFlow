import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Users, Plus, IndianRupee, BarChart3 } from 'lucide-react';
import { AppTab } from '../../types';
import { sound } from '../../utils/sound';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useApp();
  const isMr = settings.language === 'mr';

  const navItems = [
    {
      id: 'dashboard' as AppTab,
      label: isMr ? 'डॅशबोर्ड' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customers' as AppTab,
      label: isMr ? 'ग्राहक' : 'Customers',
      icon: Users,
    },
    {
      id: 'entry' as AppTab,
      label: isMr ? 'नवीन नोंद' : 'Quick Entry',
      icon: Plus,
      isHero: true,
    },
    {
      id: 'payments' as AppTab,
      label: isMr ? 'जमा / पावती' : 'Payments',
      icon: IndianRupee,
    },
    {
      id: 'reports' as AppTab,
      label: isMr ? 'रिपोर्ट्स' : 'Reports',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-sheet pb-safe">
      <div className="max-w-md mx-auto px-3 flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isHero) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className="relative -top-5 flex flex-col items-center group active-press focus:outline-none"
                aria-label={item.label}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-button transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-800 scale-105 ring-4 ring-blue-100'
                      : 'bg-brand-700 hover:bg-brand-800 hover:scale-105'
                  }`}
                >
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-brand-800 mt-1">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(item.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-colors active-press ${
                isActive ? 'text-brand-800 font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-800" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
