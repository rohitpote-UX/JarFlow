import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Settings, Building, Phone, QrCode, IndianRupee, RotateCcw } from 'lucide-react';
import { defaultCustomers, defaultSettings } from '../../utils/storage';
import { sound } from '../../utils/sound';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    settingsModalOpen,
    setSettingsModalOpen,
  } = useApp();

  const isMr = settings.language === 'mr';

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [phone, setPhone] = useState(settings.phone);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [defaultJarRate, setDefaultJarRate] = useState(settings.defaultJarRate);
  const [totalGodownJars, setTotalGodownJars] = useState(settings.totalGodownJars);

  if (!settingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      ownerName,
      phone,
      upiId,
      defaultJarRate: Number(defaultJarRate) || 35,
      totalGodownJars: Number(totalGodownJars) || 500,
    });
    setSettingsModalOpen(false);
  };

  const handleResetDefaults = () => {
    if (confirm(isMr ? 'सर्व मूळ सेटिंग्ज आणि नमुना डेटा पूर्ववत करायचा आहे का?' : 'Reset all data to defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-sheet space-y-3.5 animate-slide-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-800 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {isMr ? 'व्यवसाय सेटिंग्ज' : 'Business Settings'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isMr ? 'नाव, फोन नंबर आणि जार दर बदला' : 'Customize business profile & jar rates'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setSettingsModalOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isMr ? 'व्यवसायाचे नाव' : 'Business Name'}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isMr ? 'मालकाचे नाव' : 'Owner Name'}
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isMr ? 'मोबाईल नंबर' : 'Phone'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isMr ? 'डीफॉल्ट दर (₹ / जार)' : 'Default Rate (₹ / Jar)'}
              </label>
              <input
                type="number"
                value={defaultJarRate}
                onChange={(e) => setDefaultJarRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isMr ? 'एकूण गोदाम जार साठा' : 'Total Godown Fleet'}
              </label>
              <input
                type="number"
                value={totalGodownJars}
                onChange={(e) => setTotalGodownJars(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isMr ? 'UPI आयडी (QR पेमेंटसाठी)' : 'UPI ID (For Payment Receipt QR)'}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="pureflow@upi"
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-brand-800 hover:bg-brand-900 text-white font-bold shadow-button active-press"
            >
              {isMr ? 'सेटिंग्ज सेव्ह करा' : 'Save Changes'}
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] text-danger-600 hover:underline flex items-center gap-1 active-press"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isMr ? 'मूळ नमुना डेटा पूर्ववत करा' : 'Reset to Sample Data'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
