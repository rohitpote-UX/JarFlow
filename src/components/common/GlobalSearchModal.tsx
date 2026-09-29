import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, User, Package, IndianRupee, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { sound } from '../../utils/sound';

export const GlobalSearchModal: React.FC = () => {
  const {
    customers,
    jars,
    transactions,
    globalSearchOpen,
    setGlobalSearchOpen,
    setSelectedCustomerId,
    setActiveTab,
    settings,
  } = useApp();

  const isMr = settings.language === 'mr';
  const [query, setQuery] = useState('');

  if (!globalSearchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedCustomers = trimmed
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed) ||
          c.mobile.includes(trimmed) ||
          c.area.toLowerCase().includes(trimmed)
      )
    : [];

  const matchedJars = trimmed
    ? jars.filter(
        (j) =>
          j.serialNumber.toLowerCase().includes(trimmed) ||
          (j.currentCustomerName && j.currentCustomerName.toLowerCase().includes(trimmed))
      )
    : [];

  const matchedTransactions = trimmed
    ? transactions.filter((t) => t.customerName.toLowerCase().includes(trimmed)).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 pt-12 sm:pt-20 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-4 shadow-sheet space-y-3 animate-slide-up">
        {/* Search Input Bar */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isMr
                ? 'ग्राहक, मोबाईल नंबर किंवा जार ID शोधा...'
                : 'Search customer name, mobile, or Jar serial...'
            }
            className="w-full pl-11 pr-10 py-3 text-sm rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800"
            autoFocus
          />
          <button
            onClick={() => {
              sound.playClick();
              setGlobalSearchOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 absolute right-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto space-y-3 text-xs pr-1">
          {trimmed === '' ? (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <span>{isMr ? 'काहीतरी टाईप करून शोधा' : 'Type to search instantly'}</span>
            </div>
          ) : (
            <>
              {/* Customers matches */}
              {matchedCustomers.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {isMr ? 'ग्राहक (Customers)' : 'Customers'}
                  </span>
                  <div className="space-y-1">
                    {matchedCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCustomerId(c.id);
                          setGlobalSearchOpen(false);
                          setActiveTab('customers');
                        }}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-brand-800" />
                          <div>
                            <span className="font-bold text-gray-900 block">{c.name}</span>
                            <span className="text-gray-500 text-[10px]">{c.area} • {c.mobile}</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="font-bold text-brand-800">🪣 {c.currentJars}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jars matches */}
              {matchedJars.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    {isMr ? 'जार साठा (Jars)' : 'Jars'}
                  </span>
                  <div className="space-y-1">
                    {matchedJars.map((j) => (
                      <div
                        key={j.id}
                        className="p-2.5 rounded-xl bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="font-mono font-bold text-gray-900">{j.serialNumber}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-800">
                          {j.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedCustomers.length === 0 && matchedJars.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <span>{isMr ? 'कोणतेही परिणाम सापडले नाहीत' : 'No matching results found'}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
