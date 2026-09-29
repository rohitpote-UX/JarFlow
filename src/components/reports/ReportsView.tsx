import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  IndianRupee,
  Search,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateDailySummaryPDF } from '../../utils/pdfGenerator';
import { exportTransactionsCSV } from '../../utils/exportUtils';
import { sound } from '../../utils/sound';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    customers,
    settings,
    totalJars,
    availableJars,
    customerJars,
    damagedJars,
    totalUdhariAll,
  } = useApp();

  const isMr = settings.language === 'mr';

  const [activeReportTab, setActiveReportTab] = useState<'daily' | 'udhari' | 'jar_stock'>('daily');
  const [searchTerm, setSearchTerm] = useState('');

  // Daily totals
  const todayTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });

  const todayGiven = todayTransactions.reduce((sum, t) => sum + t.jarsGiven, 0);
  const todayReturned = todayTransactions.reduce((sum, t) => sum + t.jarsReturned, 0);
  const todayCash = todayTransactions.reduce((sum, t) => sum + t.cashPaid, 0);
  const todayUPI = todayTransactions.reduce((sum, t) => sum + t.upiPaid, 0);
  const todayUdhari = todayTransactions.reduce((sum, t) => sum + t.udhariAmount, 0);

  // Udhari customers sorted descending
  const udhariCustomers = customers
    .filter((c) => c.pendingAmount > 0)
    .sort((a, b) => b.pendingAmount - a.pendingAmount);

  const handlePrintDailyPDF = () => {
    sound.playClick();
    generateDailySummaryPDF(new Date().toISOString(), todayTransactions, settings);
  };

  const handleExportCSV = () => {
    sound.playClick();
    exportTransactionsCSV(todayTransactions, `JarFlow_Daily_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="pb-28 pt-2 px-3.5 max-w-4xl mx-auto space-y-3.5 animate-fade-in">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
            <BarChart3 className="w-5 h-5 text-brand-800" />
            {isMr ? 'व्यवसाय अहवाल व ताळेबंद' : 'Business Reports & Ledger'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {isMr ? 'दैनिक हिशोब, येणे बाकी उधारी आणि जार अहवाल' : 'Daily sales, udhari balances & stock ledger'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrintDailyPDF}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-danger-700 text-xs font-bold flex items-center gap-1 active-press"
            title="Download Daily PDF Report"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-success-700 text-xs font-bold flex items-center gap-1 active-press"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1 active-press"
            title="Print"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{isMr ? 'प्रिंट' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveReportTab('daily');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press ${
            activeReportTab === 'daily'
              ? 'bg-brand-800 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          📅 {isMr ? 'आजचा दैनिक अहवाल' : 'Daily Sales Report'}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveReportTab('udhari');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press ${
            activeReportTab === 'udhari'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          ⚠️ {isMr ? 'उधारी बाकी अहवाल' : 'Pending Udhari'} ({udhariCustomers.length})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveReportTab('jar_stock');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active-press ${
            activeReportTab === 'jar_stock'
              ? 'bg-brand-800 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          🪣 {isMr ? 'जार साठा अहवाल' : 'Jar Stock Report'}
        </button>
      </div>

      {/* TAB 1: Daily Report */}
      {activeReportTab === 'daily' && (
        <div className="space-y-3">
          {/* Key Day Totals Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'आज दिलेले जार' : 'Jars Given'}:</span>
              <span className="text-xl font-black text-brand-800">{todayGiven}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'आज परत आलेले' : 'Jars Returned'}:</span>
              <span className="text-xl font-black text-success-600">{todayReturned}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'एकूण जमा रक्कम' : 'Cash + UPI'}:</span>
              <span className="text-xl font-black text-success-600">{formatCurrency(todayCash + todayUPI)}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'नवीन उधारी' : 'New Udhari'}:</span>
              <span className="text-xl font-black text-danger-600">{formatCurrency(todayUdhari)}</span>
            </div>
          </div>

          {/* Today Transactions Table */}
          <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              {isMr ? 'आज झालेले सर्व व्यवहार' : "Today's Transaction Log"}
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {todayTransactions.length === 0 ? (
                <p className="text-center py-6 text-gray-400">
                  {isMr ? 'आज अजून कोणतीही नोंद झालेली नाही.' : 'No transactions recorded today.'}
                </p>
              ) : (
                todayTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900">{tx.customerName}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {isMr ? 'दिले' : 'Given'}: {tx.jarsGiven} • {isMr ? 'जमा' : 'Ret'}: {tx.jarsReturned} •{' '}
                        <span className="font-semibold text-brand-800">{tx.paymentMode}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block text-xs">
                        {formatCurrency(tx.totalPaid)} {isMr ? 'जमा' : 'Paid'}
                      </span>
                      {tx.udhariAmount > 0 && (
                        <span className="text-[10px] text-danger-600 font-bold">
                          +{formatCurrency(tx.udhariAmount)} {isMr ? 'उधारी' : 'Udhari'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Udhari Report */}
      {activeReportTab === 'udhari' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-red-50/80 border border-red-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-600">{isMr ? 'सर्व ग्राहकांची एकूण उधारी' : 'Total Outstanding Udhari'}:</span>
              <span className="text-2xl font-black text-danger-600 block mt-0.5">
                {formatCurrency(totalUdhariAll)}
              </span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-200 text-danger-800">
              {udhariCustomers.length} {isMr ? 'ग्राहक बाकीदार' : 'Pending Clients'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-card divide-y divide-gray-100 text-xs">
            {udhariCustomers.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {c.area} • {c.mobile} • {c.currentJars} {isMr ? 'जार जवळ' : 'Jars held'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-danger-600 block">
                    {formatCurrency(c.pendingAmount)}
                  </span>
                  <a
                    href={`https://wa.me/91${c.mobile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-success-700 hover:underline inline-block mt-0.5"
                  >
                    💬 WhatsApp Reminder
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Jar Stock Ledger */}
      {activeReportTab === 'jar_stock' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'एकूण साठा' : 'Total Fleet'}:</span>
              <span className="text-xl font-black text-brand-800">{totalJars}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'गोदाम उपलब्ध' : 'Available'}:</span>
              <span className="text-xl font-black text-success-600">{availableJars}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'ग्राहकांकडे' : 'With Customers'}:</span>
              <span className="text-xl font-black text-indigo-700">{customerJars}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-card">
              <span className="text-gray-500 font-medium block">{isMr ? 'खराब / फुटलेले' : 'Damaged'}:</span>
              <span className="text-xl font-black text-danger-600">{damagedJars}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
