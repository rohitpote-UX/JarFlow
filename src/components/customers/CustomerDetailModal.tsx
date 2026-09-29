import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Phone,
  MessageCircle,
  Plus,
  FileText,
  FileSpreadsheet,
  IndianRupee,
  MapPin,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate, createWhatsAppMessage } from '../../utils/formatters';
import { generateCustomerLedgerPDF } from '../../utils/pdfGenerator';
import { exportCustomerLedgerCSV } from '../../utils/exportUtils';
import { sound } from '../../utils/sound';

interface CustomerDetailModalProps {
  customerId: string;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customerId,
  onClose,
}) => {
  const {
    customers,
    getCustomerLedger,
    settings,
    setActiveTab,
    setSelectedCustomerId,
  } = useApp();

  const isMr = settings.language === 'mr';
  const customer = customers.find((c) => c.id === customerId);
  const ledger = getCustomerLedger(customerId);

  const [activeTab, setActiveDetailTab] = useState<'ledger' | 'info'>('ledger');

  if (!customer) return null;

  const handleDownloadPDF = () => {
    sound.playClick();
    generateCustomerLedgerPDF(customer, ledger, settings);
  };

  const handleExportCSV = () => {
    sound.playClick();
    exportCustomerLedgerCSV(customer, ledger);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-5 shadow-sheet space-y-3.5 animate-slide-up max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">{customer.name}</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{customer.area} • {customer.mobile}</span>
            </p>
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

        {/* Highlight Balance Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80">
            <span className="text-[11px] font-bold text-gray-600 block">
              {isMr ? 'ग्राहकाकडे असलेले जार' : 'Current Jars with Customer'}
            </span>
            <span className="text-2xl font-black text-brand-800 mt-0.5 block">
              {customer.currentJars} <span className="text-sm font-semibold">{isMr ? 'जार' : 'Jars'}</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200/80">
            <span className="text-[11px] font-bold text-gray-600 block">
              {isMr ? 'बाकी उधारी (येणे बाकी)' : 'Pending Udhari Balance'}
            </span>
            <span className="text-2xl font-black text-danger-600 mt-0.5 block">
              {formatCurrency(customer.pendingAmount)}
            </span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-4 gap-2">
          {/* Call */}
          <a
            href={`tel:${customer.mobile}`}
            onClick={() => sound.playClick()}
            className="py-2 px-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 active-press"
          >
            <Phone className="w-4 h-4 text-gray-700" />
            <span>{isMr ? 'कॉल' : 'Call'}</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/91${customer.mobile}?text=${createWhatsAppMessage(
              customer.name,
              settings.businessName,
              {
                currentJars: customer.currentJars,
                pendingAmount: customer.pendingAmount,
              },
              isMr ? 'mr' : 'en'
            )}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => sound.playClick()}
            className="py-2 px-1 rounded-xl bg-green-50 hover:bg-green-100 text-success-700 text-[11px] font-bold flex flex-col items-center justify-center gap-1 active-press border border-green-200/60"
          >
            <MessageCircle className="w-4 h-4 text-success-600" />
            <span>WhatsApp</span>
          </a>

          {/* Give/Return Jar */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCustomerId(customer.id);
              onClose();
              setActiveTab('entry');
            }}
            className="py-2 px-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-800 text-[11px] font-bold flex flex-col items-center justify-center gap-1 active-press border border-blue-200/60"
          >
            <Plus className="w-4 h-4 text-brand-700" />
            <span>{isMr ? 'जार नोंद' : 'Give Jar'}</span>
          </button>

          {/* Add Payment */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedCustomerId(customer.id);
              onClose();
              setActiveTab('payments');
            }}
            className="py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-warning-700 text-[11px] font-bold flex flex-col items-center justify-center gap-1 active-press border border-amber-200/60"
          >
            <IndianRupee className="w-4 h-4 text-warning-600" />
            <span>{isMr ? 'जमा पावती' : 'Payment'}</span>
          </button>
        </div>

        {/* Ledger vs Info Tab Toggle */}
        <div className="flex items-center justify-between border-b border-gray-200 pt-1">
          <div className="flex gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setActiveDetailTab('ledger');
              }}
              className={`pb-2 text-xs font-bold transition border-b-2 ${
                activeTab === 'ledger'
                  ? 'border-brand-800 text-brand-800'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {isMr ? 'खातेवही (Ledger)' : 'Customer Ledger'}
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveDetailTab('info');
              }}
              className={`pb-2 text-xs font-bold transition border-b-2 ${
                activeTab === 'info'
                  ? 'border-brand-800 text-brand-800'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {isMr ? 'तपशील व माहिती' : 'Profile & Info'}
            </button>
          </div>

          {/* Export Actions */}
          {activeTab === 'ledger' && (
            <div className="flex items-center gap-1.5 pb-2">
              <button
                onClick={handleDownloadPDF}
                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-danger-700 text-[11px] font-bold flex items-center gap-1 active-press"
                title="Download PDF Statement"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-success-700 text-[11px] font-bold flex items-center gap-1 active-press"
                title="Export Excel/CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: Ledger Table */}
        {activeTab === 'ledger' && (
          <div className="flex-1 overflow-y-auto min-h-[220px]">
            {ledger.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                {isMr ? 'अजून कोणताही व्यवहार नोंदवलेला नाही.' : 'No transactions recorded yet.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {ledger.map((entry) => (
                  <div key={entry.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {formatDate(entry.date)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            entry.type === 'TRANSACTION'
                              ? 'bg-blue-100 text-brand-800'
                              : 'bg-green-100 text-success-700'
                          }`}
                        >
                          {entry.type === 'TRANSACTION'
                            ? isMr
                              ? 'जार वाटप'
                              : 'Delivery'
                            : isMr
                            ? 'जमा पावती'
                            : 'Payment'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {entry.type === 'TRANSACTION'
                          ? `${isMr ? 'दिले' : 'Given'}: ${entry.given} | ${isMr ? 'जमा' : 'Ret'}: ${entry.returned} | ${isMr ? 'बिल' : 'Bill'}: ₹${entry.billAmount}`
                          : `${isMr ? 'जमा रक्कम' : 'Amount'}: ₹${entry.paidAmount} (${entry.paymentMode})`}
                      </p>
                    </div>

                    <div className="text-right">
                      {entry.udhariAdded > 0 && (
                        <span className="text-[10px] text-amber-600 font-bold block">
                          +{formatCurrency(entry.udhariAdded)} {isMr ? 'उधारी' : 'Udhari'}
                        </span>
                      )}
                      <span className="font-bold text-gray-900 block text-xs">
                        {isMr ? 'शिल्लक' : 'Bal'}: {formatCurrency(entry.runningBalance)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Customer Profile Info */}
        {activeTab === 'info' && (
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-2xl bg-gray-50 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'पत्ता' : 'Address'}:</span>
                <span className="font-semibold text-gray-900">{customer.address || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'परिसर' : 'Area'}:</span>
                <span className="font-semibold text-gray-900">{customer.area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'जार दर' : 'Jar Rate'}:</span>
                <span className="font-semibold text-gray-900">₹{customer.defaultRate || 35}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{isMr ? 'ग्राहकाची नोंद तारीख' : 'Member Since'}:</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formatDate(customer.createdAt)}
                </span>
              </div>
              {customer.notes && (
                <div className="pt-1 border-t border-gray-200">
                  <span className="text-gray-500 block mb-0.5">{isMr ? 'टीप' : 'Notes'}:</span>
                  <p className="text-gray-800 italic bg-white p-2 rounded-lg border border-gray-100">
                    "{customer.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
