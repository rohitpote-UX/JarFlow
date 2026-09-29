import React, { ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, Wifi, Battery, Signal } from 'lucide-react';
import { sound } from '../../utils/sound';

export const DesktopWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { mobileFrameView, setMobileFrameView } = useApp();

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-start sm:p-4 md:p-6 transition-all duration-300">
      {/* Frame Switcher Bar for Desktop */}
      <div className="hidden md:flex items-center gap-3 mb-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200 shadow-sm text-xs font-semibold text-gray-700">
        <span className="text-gray-400">View Mode:</span>
        <button
          onClick={() => {
            sound.playClick();
            setMobileFrameView(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
            mobileFrameView
              ? 'bg-brand-800 text-white shadow-button'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Phone Frame (iPhone 16)</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setMobileFrameView(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
            !mobileFrameView
              ? 'bg-brand-800 text-white shadow-button'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Responsive View</span>
        </button>
      </div>

      {/* Main Container */}
      {mobileFrameView ? (
        <div className="relative w-full max-w-[430px] h-[900px] max-h-[95vh] bg-[#FAFAFA] rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border-[10px] border-[#1E293B] overflow-hidden flex flex-col">
          {/* iOS Dynamic Island & Status Bar */}
          <div className="bg-white/95 px-6 pt-3 pb-1 flex items-center justify-between z-40 select-none border-b border-gray-100">
            <span className="text-xs font-bold text-gray-900 tracking-tight">09:41</span>
            
            {/* Dynamic Island pill */}
            <div className="w-24 h-5 rounded-full bg-black mx-auto flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500/80 mr-1 animate-pulse" />
            </div>

            <div className="flex items-center gap-1 text-gray-900">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Phone Scroll Content */}
          <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400/80 rounded-full z-50 pointer-events-none" />
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-[#FAFAFA] min-h-screen sm:rounded-3xl shadow-soft sm:border sm:border-gray-200 overflow-hidden flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
};
