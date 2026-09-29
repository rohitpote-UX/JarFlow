import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus } from 'lucide-react';
import { sound } from '../../utils/sound';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer, settings } = useApp();
  const isMr = settings.language === 'mr';

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [area, setArea] = useState('Kothrud');
  const [address, setAddress] = useState('');
  const [initialJars, setInitialJars] = useState(0);
  const [initialPending, setInitialPending] = useState(0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      mobile: mobile.trim() || '9876543210',
      area: area.trim(),
      address: address.trim(),
      active: true,
      currentJars: Number(initialJars) || 0,
      pendingAmount: Number(initialPending) || 0,
      defaultRate: settings.defaultJarRate || 35,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-sheet space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-800 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {isMr ? 'नवीन ग्राहक जोडा' : 'Add New Customer'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isMr ? 'ग्राहकाचे नाव आणि सुरुवातीचा तपशील' : 'Customer profile & initial balance'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {isMr ? 'ग्राहकाचे नाव *' : 'Customer Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMr ? 'उदा. सचिन पाटील / हॉटेल स्वाती' : 'e.g. Sachin Patil / Green Hotel'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isMr ? 'मोबाईल नंबर' : 'Mobile Number'}
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9822000000"
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                {isMr ? 'परिसर / एरिया' : 'Area / Route'}
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Kothrud / Baner"
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {isMr ? 'पत्ता' : 'Full Address'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isMr ? 'फ्लॅट क्र., इमारत, रस्ता...' : 'Shop/Flat No, Landmark...'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                {isMr ? 'सध्या असलेले जार' : 'Initial Jars'}
              </label>
              <input
                type="number"
                min="0"
                value={initialJars}
                onChange={(e) => setInitialJars(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 font-bold text-brand-800"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                {isMr ? 'मागील उधारी (₹)' : 'Initial Udhari (₹)'}
              </label>
              <input
                type="number"
                min="0"
                value={initialPending}
                onChange={(e) => setInitialPending(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 font-bold text-danger-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {isMr ? 'टीप / सूचना' : 'Notes / Remarks'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isMr ? 'उदा. सकाळी ९ वाजता जार द्यावे' : 'e.g. Morning delivery preferred'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] py-2.5 rounded-2xl bg-brand-800 hover:bg-brand-900 active-press text-white text-xs font-bold shadow-button"
            >
              {isMr ? 'ग्राहक सेव्ह करा' : 'Save Customer Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
