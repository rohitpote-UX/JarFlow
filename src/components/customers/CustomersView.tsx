import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerDetailModal } from './CustomerDetailModal';
import { AddCustomerModal } from './AddCustomerModal';
import {
  Search,
  UserPlus,
  Phone,
  MessageCircle,
  Plus,
  Filter,
} from 'lucide-react';
import { formatCurrency, createWhatsAppMessage } from '../../utils/formatters';
import { sound } from '../../utils/sound';

export const CustomersView: React.FC = () => {
  const {
    customers,
    settings,
    selectedCustomerId,
    setSelectedCustomerId,
    setActiveTab,
  } = useApp();

  const isMr = settings.language === 'mr';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with_jars' | 'with_udhari'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered customer list
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.mobile.includes(searchTerm) ||
      cust.area.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'with_jars') return cust.currentJars > 0;
    if (filterType === 'with_udhari') return cust.pendingAmount > 0;
    return true;
  });

  const totalHeldJars = customers.reduce((sum, c) => sum + (c.currentJars || 0), 0);
  const totalPendingUdhari = customers.reduce((sum, c) => sum + (c.pendingAmount || 0), 0);

  return (
    <div className="pb-28 pt-2 px-3.5 max-w-4xl mx-auto space-y-3.5 animate-fade-in">
      {/* Top Banner Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">
            {isMr ? 'ग्राहक यादी व खाती' : 'Customers & Accounts'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {customers.length} {isMr ? 'ग्राहक' : 'Customers'} • {totalHeldJars} {isMr ? 'जार बाजारात' : 'Jars in Market'}
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-button active-press"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isMr ? 'नवीन ग्राहक' : 'Add Customer'}</span>
        </button>
      </div>

      {/* Summary highlight bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
          <span className="text-gray-600 font-medium">{isMr ? 'ग्राहकांकडे जार' : 'Total Jars Held'}:</span>
          <span className="font-extrabold text-brand-800">{totalHeldJars} {isMr ? 'जार' : 'Jars'}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-red-50/80 border border-red-100 flex items-center justify-between">
          <span className="text-gray-600 font-medium">{isMr ? 'एकूण उधारी' : 'Total Udhari'}:</span>
          <span className="font-extrabold text-danger-600">{formatCurrency(totalPendingUdhari)}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isMr
                ? 'नाव, मोबाईल किंवा एरिया शोधा (Search...)'
                : 'Search by customer name, mobile, area...'
            }
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-800 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              sound.playClick();
              setFilterType('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-brand-800 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {isMr ? 'सर्व ग्राहक' : 'All Customers'} ({customers.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterType('with_jars');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press whitespace-nowrap ${
              filterType === 'with_jars'
                ? 'bg-brand-800 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            🪣 {isMr ? 'जार असलेले' : 'With Jars'} ({customers.filter((c) => c.currentJars > 0).length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setFilterType('with_udhari');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press whitespace-nowrap ${
              filterType === 'with_udhari'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            ⚠️ {isMr ? 'उधारी बाकी' : 'Udhari Due'} ({customers.filter((c) => c.pendingAmount > 0).length})
          </button>
        </div>
      </div>

      {/* Customer Cards List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center text-xs text-gray-400">
            <Filter className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <span>{isMr ? 'कोणतेही ग्राहक सापडले नाहीत.' : 'No customers matched your filter.'}</span>
          </div>
        ) : (
          filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white p-3.5 rounded-3xl border border-surface-border shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div
                onClick={() => {
                  sound.playClick();
                  setSelectedCustomerId(cust.id);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 leading-tight">
                      {cust.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      {cust.area} • {cust.mobile}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-brand-800">
                    {cust.defaultRate ? `₹${cust.defaultRate}/jar` : '₹35/jar'}
                  </span>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="px-2.5 py-1 rounded-xl bg-blue-50 text-brand-800 text-xs font-bold">
                    🪣 {cust.currentJars} {isMr ? 'जार' : 'Jars'}
                  </div>

                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      cust.pendingAmount > 0
                        ? 'bg-red-50 text-danger-600'
                        : 'bg-green-50 text-success-700'
                    }`}
                  >
                    {cust.pendingAmount > 0
                      ? `₹${cust.pendingAmount} ${isMr ? 'उधारी' : 'Pending'}`
                      : isMr
                      ? '✓ सर्व हिशोब क्लिअर'
                      : '✓ Nil Balance'}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedCustomerId(cust.id);
                  }}
                  className="text-xs font-bold text-brand-800 hover:underline"
                >
                  {isMr ? 'खातेवही पहा' : 'View Ledger'} →
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Phone */}
                  <a
                    href={`tel:${cust.mobile}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                    }}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active-press"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/91${cust.mobile}?text=${createWhatsAppMessage(
                      cust.name,
                      settings.businessName,
                      {
                        currentJars: cust.currentJars,
                        pendingAmount: cust.pendingAmount,
                      },
                      isMr ? 'mr' : 'en'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                    }}
                    className="w-8 h-8 rounded-xl bg-green-50 hover:bg-green-100 text-success-600 flex items-center justify-center active-press border border-green-200"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>

                  {/* Quick Give/Return Jar */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedCustomerId(cust.id);
                      setActiveTab('entry');
                    }}
                    className="h-8 px-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold flex items-center gap-1 active-press"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isMr ? 'जार नोंद' : 'Entry'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Detail Modal if a customer is selected */}
      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
